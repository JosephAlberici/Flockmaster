const STORAGE_KEY = "flockmasterSave";
const CLOUD_SAVE_META_KEY = "flockmasterCloudMeta";
const SAVE_ENCODING_PREFIX = "FLOCKMASTER_SAVE_V1:";
const SAVE_ENCODING_KEY = "FlockmasterHarborCipher";
const BASE_TICK_MS = 1000;
// Base rarity odds before upgrades or habitat filtering adjust them.
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_WEIGHTS = {
  Common: 60,
  Uncommon: 25,
  Rare: 10,
  Epic: 4,
  Legendary: 1
};
const DOCKYARD_TREASURE_REWARD_TABLE = [
  {
    type: "item",
    itemId: "seedbaitticket",
    amount: 5,
    weight: 1
  },
  {
    type: "currency",
    resourceKey: "coins",
    amount: 10000,
    weight: 1
  },
  {
    type: "currency",
    resourceKey: "coins",
    amount: 25000,
    weight: 1
  },
  {
    type: "currency",
    resourceKey: "coins",
    amount: 50000,
    weight: 1
  },
  {
    type: "resource",
    resourceKey: "grubs",
    amount: 1000,
    weight: 1
  },
  {
    type: "resource",
    resourceKey: "grubs",
    amount: 2000,
    weight: 1
  },
  {
    type: "resource",
    resourceKey: "grubs",
    amount: 5000,
    weight: 1
  },
  {
    type: "item",
    itemId: "voyageticket",
    amount: 1,
    weight: 1
  }
];
const TREE_BONUS_KEY_BY_TREE_KEY = {
  appleTrees: "bonusAppleTree",
  pearTrees: "bonusPearTree",
  peachTrees: "bonusPeachTree",
  orangeTrees: "bonusOrangeTree"
};

const SAVE_TEXT_ENCODER = typeof TextEncoder === "function" ? new TextEncoder() : null;
const SAVE_TEXT_DECODER = typeof TextDecoder === "function" ? new TextDecoder() : null;
let cloudSyncTimeoutId = null;
let cloudSaveBootstrapPromise = null;
let cloudSaveSyncEnabled = false;

// Shared save-schema defaults
// Add new saved primitive values here first so loading, importing, and new saves stay aligned.
const GAME_STATE_DEFAULTS = {
  playerId: "",
  playerName: "",
  friendCode: "",
  seeds: 200,
  seedMax: 1000,
  grubs: 0,
  grubMax: 10000,
  grubsPerClick: 1,
  grubFarmActive: false,
  grubFarmUnlocked: false,
  hardwood: 0,
  hardwoodMax: 500,
  mice: 0,
  loggerheadShowingBird: false,
  loggerheadQuestIndex: 0,
  shrikeQuestsCompleted: 0,
  loggerheadMouseLoaded: false,
  loggerheadMouseResult: "",
  loggerheadMousePendingBirdId: null,
  loggerheadMouseIntroSeen: false,
  sawmillProcessingDurationMs: 5 * 60 * 1000,
  sawmillProcessingStart: null,
  sawmillProcessingPendingHardwood: 0,
  sawmillProcessingActive: false,
  sawmillProcessingReady: false,
  sawmillConstructed: false,
  sawmillOverseerId: null,
  sawmillTwigThreshold: 0,
  dockyardVoyageDurationMs: 60 * 60 * 1000,
  dockyardVoyageStart: null,
  dockyardVoyagePendingFish: 0,
  dockyardVoyagePendingScrap: 0,
  dockyardVoyagePendingTreasureRewards: {},
  dockyardVoyageActive: false,
  dockyardVoyageReady: false,
  dockyardHarborGiftPending: false,
  dockyardCoinThreshold: 0,
  dockyardFishPerVoyage: 20,
  dockyardScrapPerVoyage: 0,
  dockyardTreasureChance: 0.05,
  overseerAssignments: {
    sawmill: null,
    dockyard: null
  },
  coins: 80,
  coinMax: 10000,
  fish: 0,
  scrap: 0,
  twigs: 0,
  twigMax: 100000,
  trapPurchased: false,
  upgradeConfirmationEnabled: false,
  holdToClickEnabled: false,
  trapLoaded: false,
  trapPulled: false,
  trapBaitType: null,
  trapLoadCost: 20,
  trapGrubLoadCost: 25,
  catchRate: 0.5,
  lastTrapResult: "",
  items: {},
  upgrades: {},
  ownedHabitats: ["City Living"],
  redeemedCodes: [],
  parasiteTargets: {},
  parasiteUpgradeTiers: {},
  predatorUpgradeTiers: {},
  newPlotPurchased: false,
  seedDispersalPurchased: false,
  basicBeddingPurchased: false,
  advancedBeddingPurchased: false,
  cafePurchased: false,
  indoorGardenPurchased: false,
  murderPartyPurchased: false,
  flockForestryPurchased: false,
  turtleWakePurchased: false,
  pheromonesPurchased: false,
  basketPurchased: false,
  depositBoxPurchased: false,
  avianRepopulationPurchased: false,
  wildlifeRestorationPurchased: false,
  newSubstratePurchased: false,
  appleTrees: 0,
  pearTrees: 0,
  peachTrees: 0,
  orangeTrees: 0
};

// Validate number-like save fields before keeping them.
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// Validate boolean save toggles.
function isBoolean(value) {
  return typeof value === "boolean";
}

// Validate plain text save fields.
function isString(value) {
  return typeof value === "string";
}

// Allow string fields that may intentionally be unset.
function isNullableString(value) {
  return isString(value) || value === null;
}

// Allow number fields that may intentionally be unset.
function isNullableNumber(value) {
  return isFiniteNumber(value) || value === null;
}

// Detect nested save objects while excluding arrays.
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const GAME_STATE_VALIDATORS = {
  playerId: isString,
  playerName: isString,
  friendCode: isString,
  seeds: isFiniteNumber,
  seedMax: isFiniteNumber,
  grubs: isFiniteNumber,
  grubMax: isFiniteNumber,
  grubsPerClick: isFiniteNumber,
  grubFarmActive: isBoolean,
  grubFarmUnlocked: isBoolean,
  hardwood: isFiniteNumber,
  hardwoodMax: isFiniteNumber,
  mice: isFiniteNumber,
  loggerheadShowingBird: isBoolean,
  loggerheadQuestIndex: isFiniteNumber,
  shrikeQuestsCompleted: isFiniteNumber,
  loggerheadMouseLoaded: isBoolean,
  loggerheadMouseResult: isString,
  loggerheadMousePendingBirdId: isNullableString,
  loggerheadMouseIntroSeen: isBoolean,
  sawmillProcessingDurationMs: isFiniteNumber,
  sawmillProcessingStart: isNullableNumber,
  sawmillProcessingPendingHardwood: isFiniteNumber,
  sawmillProcessingActive: isBoolean,
  sawmillProcessingReady: isBoolean,
  sawmillConstructed: isBoolean,
  sawmillOverseerId: isNullableString,
  sawmillTwigThreshold: isFiniteNumber,
  dockyardVoyageDurationMs: isFiniteNumber,
  dockyardVoyageStart: isNullableNumber,
  dockyardVoyagePendingFish: isFiniteNumber,
  dockyardVoyagePendingScrap: isFiniteNumber,
  dockyardVoyagePendingTreasureRewards: isPlainObject,
  dockyardVoyageActive: isBoolean,
  dockyardVoyageReady: isBoolean,
  dockyardHarborGiftPending: isBoolean,
  dockyardCoinThreshold: isFiniteNumber,
  dockyardFishPerVoyage: isFiniteNumber,
  dockyardScrapPerVoyage: isFiniteNumber,
  dockyardTreasureChance: isFiniteNumber,
  overseerAssignments: isPlainObject,
  coins: isFiniteNumber,
  coinMax: isFiniteNumber,
  fish: isFiniteNumber,
  scrap: isFiniteNumber,
  twigs: isFiniteNumber,
  twigMax: isFiniteNumber,
  trapPurchased: isBoolean,
  upgradeConfirmationEnabled: isBoolean,
  holdToClickEnabled: isBoolean,
  trapLoaded: isBoolean,
  trapPulled: isBoolean,
  trapBaitType: isNullableString,
  trapLoadCost: isFiniteNumber,
  trapGrubLoadCost: isFiniteNumber,
  catchRate: isFiniteNumber,
  lastTrapResult: isString,
  items: isPlainObject,
  upgrades: isPlainObject,
  ownedHabitats: Array.isArray,
  redeemedCodes: Array.isArray,
  parasiteTargets: isPlainObject,
  parasiteUpgradeTiers: isPlainObject,
  predatorUpgradeTiers: isPlainObject,
  newPlotPurchased: isBoolean,
  seedDispersalPurchased: isBoolean,
  basicBeddingPurchased: isBoolean,
  advancedBeddingPurchased: isBoolean,
  cafePurchased: isBoolean,
  indoorGardenPurchased: isBoolean,
  murderPartyPurchased: isBoolean,
  flockForestryPurchased: isBoolean,
  turtleWakePurchased: isBoolean,
  pheromonesPurchased: isBoolean,
  basketPurchased: isBoolean,
  depositBoxPurchased: isBoolean,
  avianRepopulationPurchased: isBoolean,
  wildlifeRestorationPurchased: isBoolean,
  newSubstratePurchased: isBoolean,
  appleTrees: isFiniteNumber,
  pearTrees: isFiniteNumber,
  peachTrees: isFiniteNumber,
  orangeTrees: isFiniteNumber
};

// Shared save-schema helpers
// Clone defaults so arrays and objects do not share references across saves.
function cloneDefaultValue(value) {
  if (Array.isArray(value)) {
    return value.slice();
  }

  if (isPlainObject(value)) {
    return { ...value };
  }

  return value;
}

// Build the default bird-progress array used by new and repaired saves.
function createDefaultBirdProgress() {
  return cloneBirdLibrary().map(function (bird) {
    return {
      ...bird,
      count: bird.acquired ? 1 : 0,
      variantCounts: createBirdVariantCounts(bird, bird.acquired ? 1 : 0)
    };
  });
}

// Copy the shared save defaults into a fresh object.
function cloneGameStateDefaults() {
  const clonedDefaults = {};

  Object.keys(GAME_STATE_DEFAULTS).forEach(function (key) {
    clonedDefaults[key] = cloneDefaultValue(GAME_STATE_DEFAULTS[key]);
  });

  return clonedDefaults;
}

// Build the default item-count object used by new and repaired saves.
function createDefaultItemCounts() {
  return ITEM_LIBRARY.reduce(function (itemCounts, item) {
    itemCounts[item.id] = item.startingCount || 0;
    return itemCounts;
  }, {});
}

// Merge saved item counts onto the current item library.
function mergeItemCounts(savedItems) {
  const mergedItemCounts = createDefaultItemCounts();

  ITEM_LIBRARY.forEach(function (item) {
    if (savedItems && isFiniteNumber(savedItems[item.id])) {
      mergedItemCounts[item.id] = Math.max(0, savedItems[item.id]);
    }
  });

  return mergedItemCounts;
}

// Build the default owned-upgrade map so new saves and repaired saves share
// the same shape even before every upgrade has been purchased once.
function createDefaultUpgradeOwnership() {
  return Object.keys(UPGRADE_LIBRARY).reduce(function (ownedUpgrades, upgradeId) {
    ownedUpgrades[upgradeId] = false;
    return ownedUpgrades;
  }, {});
}

// Merge saved upgrade ownership with the current catalogue and backfill from
// older top-level booleans while the project transitions to the new system.
function mergeUpgradeOwnership(savedUpgrades, gameState) {
  const mergedUpgradeOwnership = createDefaultUpgradeOwnership();

  Object.keys(UPGRADE_LIBRARY).forEach(function (upgradeId) {
    const upgradeDefinition = UPGRADE_LIBRARY[upgradeId];

    if (savedUpgrades && typeof savedUpgrades[upgradeId] === "boolean") {
      mergedUpgradeOwnership[upgradeId] = savedUpgrades[upgradeId];
      return;
    }

    if (
      upgradeDefinition &&
      typeof upgradeDefinition.legacyPurchasedKey === "string" &&
      gameState[upgradeDefinition.legacyPurchasedKey] === true
    ) {
      mergedUpgradeOwnership[upgradeId] = true;
      return;
    }

    if (
      upgradeDefinition &&
      typeof upgradeDefinition.deriveOwned === "function" &&
      upgradeDefinition.deriveOwned(gameState) === true
    ) {
      mergedUpgradeOwnership[upgradeId] = true;
    }
  });

  return mergedUpgradeOwnership;
}

// Fill one save field with its default when validation fails.
function applyValidatedDefault(gameState, key) {
  if (!GAME_STATE_VALIDATORS[key](gameState[key])) {
    gameState[key] = cloneDefaultValue(GAME_STATE_DEFAULTS[key]);
  }
}

// Save encoding helpers
// This adds a lightweight client-side encoding layer so saves are no longer
// stored as immediately readable JSON. Because the game must decrypt its own
// saves in the browser, this is deterrence/obfuscation rather than true secure
// anti-tamper cryptography.
function bytesToBase64(bytes) {
  let binaryString = "";

  bytes.forEach(function (byteValue) {
    binaryString += String.fromCharCode(byteValue);
  });

  return btoa(binaryString);
}

function base64ToBytes(base64Text) {
  const binaryString = atob(base64Text);
  const decodedBytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    decodedBytes[index] = binaryString.charCodeAt(index);
  }

  return decodedBytes;
}

function getSaveKeyBytes() {
  if (SAVE_TEXT_ENCODER) {
    return SAVE_TEXT_ENCODER.encode(SAVE_ENCODING_KEY);
  }

  const fallbackBytes = new Uint8Array(SAVE_ENCODING_KEY.length);

  for (let index = 0; index < SAVE_ENCODING_KEY.length; index += 1) {
    fallbackBytes[index] = SAVE_ENCODING_KEY.charCodeAt(index) & 255;
  }

  return fallbackBytes;
}

function encodeSavePayload(saveText) {
  if (typeof saveText !== "string") {
    return saveText;
  }

  const sourceBytes = SAVE_TEXT_ENCODER
    ? SAVE_TEXT_ENCODER.encode(saveText)
    : new Uint8Array(saveText.split("").map(function (character) {
        return character.charCodeAt(0) & 255;
      }));
  const keyBytes = getSaveKeyBytes();
  const encodedBytes = new Uint8Array(sourceBytes.length);

  for (let index = 0; index < sourceBytes.length; index += 1) {
    const rollingMask = ((index * 31) + 17) & 255;
    encodedBytes[index] = sourceBytes[index] ^ keyBytes[index % keyBytes.length] ^ rollingMask;
  }

  return SAVE_ENCODING_PREFIX + bytesToBase64(encodedBytes);
}

function decodeSavePayload(saveText) {
  if (typeof saveText !== "string") {
    throw new Error("Save data must be text");
  }

  if (!saveText.startsWith(SAVE_ENCODING_PREFIX)) {
    return saveText;
  }

  const encodedText = saveText.slice(SAVE_ENCODING_PREFIX.length);
  const encodedBytes = base64ToBytes(encodedText);
  const keyBytes = getSaveKeyBytes();
  const decodedBytes = new Uint8Array(encodedBytes.length);

  for (let index = 0; index < encodedBytes.length; index += 1) {
    const rollingMask = ((index * 31) + 17) & 255;
    decodedBytes[index] = encodedBytes[index] ^ keyBytes[index % keyBytes.length] ^ rollingMask;
  }

  if (SAVE_TEXT_DECODER) {
    return SAVE_TEXT_DECODER.decode(decodedBytes);
  }

  let decodedText = "";
  decodedBytes.forEach(function (byteValue) {
    decodedText += String.fromCharCode(byteValue);
  });
  return decodedText;
}

function serializeGameState(gameState) {
  ensurePlayerAccountIdentity(gameState);
  return encodeSavePayload(JSON.stringify(gameState));
}

function createGameStateSnapshot(gameState) {
  ensurePlayerAccountIdentity(gameState);
  return JSON.parse(JSON.stringify(gameState));
}

function parseSavedGameState(saveText) {
  return JSON.parse(decodeSavePayload(saveText));
}

function replaceLocalGameState(nextGameState) {
  const normalizedGameState = normalizeGameState(nextGameState);
  saveGameState(normalizedGameState);
  return normalizedGameState;
}

function cloneJsonValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCloudSaveMeta() {
  try {
    const savedMeta = localStorage.getItem(CLOUD_SAVE_META_KEY);

    if (!savedMeta) {
      return null;
    }

    const parsedMeta = JSON.parse(savedMeta);
    return isPlainObject(parsedMeta) ? parsedMeta : null;
  } catch (error) {
    return null;
  }
}

function setCloudSaveMeta(meta) {
  if (!isPlainObject(meta)) {
    localStorage.removeItem(CLOUD_SAVE_META_KEY);
    return;
  }

  localStorage.setItem(CLOUD_SAVE_META_KEY, JSON.stringify(meta));
}

function clearCloudSaveMeta() {
  localStorage.removeItem(CLOUD_SAVE_META_KEY);
}

function hasSupabaseCloudClient() {
  return typeof window !== "undefined" && window.SUPABASE_CONFIGURED && !!window.supabaseClient;
}

async function getAuthenticatedCloudUser() {
  if (!hasSupabaseCloudClient()) {
    return null;
  }

  const sessionResult = await window.supabaseClient.auth.getSession();

  if (sessionResult.error || !sessionResult.data || !sessionResult.data.session || !sessionResult.data.session.user) {
    return null;
  }

  return sessionResult.data.session.user;
}

async function fetchCloudSaveRecordForUser(userId) {
  if (!hasSupabaseCloudClient() || !userId) {
    return null;
  }

  const { data, error } = await window.supabaseClient
    .from("user_saves")
    .select("user_id, save_data, points, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

async function syncPlayerProfileToSupabase(gameState, updatedAtIso) {
  if (!hasSupabaseCloudClient()) {
    return;
  }

  const { error } = await window.supabaseClient
    .from("players")
    .upsert({
      id: gameState.playerId,
      player_name: gameState.playerName,
      friend_code: gameState.friendCode,
      points: getPoints(gameState),
      updated_at: updatedAtIso || new Date().toISOString()
    });

  if (error) {
    throw error;
  }
}

async function uploadCloudSaveSnapshot(gameState) {
  const authenticatedUser = await getAuthenticatedCloudUser();

  if (!authenticatedUser) {
    return false;
  }

  const updatedAtIso = new Date().toISOString();
  const snapshot = createGameStateSnapshot(gameState);
  const { error } = await window.supabaseClient
    .from("user_saves")
    .upsert({
      user_id: authenticatedUser.id,
      save_data: snapshot,
      points: getPoints(snapshot),
      updated_at: updatedAtIso
    });

  if (error) {
    throw error;
  }

  await syncPlayerProfileToSupabase(snapshot, updatedAtIso);
  setCloudSaveMeta({
    userId: authenticatedUser.id,
    updatedAt: updatedAtIso
  });
  return true;
}

function queueCloudSaveSync(gameState) {
  if (!cloudSaveSyncEnabled || !hasSupabaseCloudClient()) {
    return;
  }

  if (cloudSyncTimeoutId !== null) {
    clearTimeout(cloudSyncTimeoutId);
  }

  cloudSyncTimeoutId = setTimeout(function () {
    cloudSyncTimeoutId = null;
    uploadCloudSaveSnapshot(gameState).catch(function (error) {
      console.warn("Cloud save sync failed", error);
    });
  }, 1200);
}

async function initCloudSaveForCurrentPage(gameState, options) {
  const initOptions = options || {};

  if (!hasSupabaseCloudClient()) {
    cloudSaveSyncEnabled = false;
    return false;
  }

  if (cloudSaveBootstrapPromise) {
    return cloudSaveBootstrapPromise;
  }

  cloudSaveBootstrapPromise = (async function () {
    cloudSaveSyncEnabled = false;
    const authenticatedUser = await getAuthenticatedCloudUser();

    if (!authenticatedUser) {
      clearCloudSaveMeta();
      cloudSaveBootstrapPromise = null;
      return false;
    }

    const cloudSaveRecord = await fetchCloudSaveRecordForUser(authenticatedUser.id);

    if (!cloudSaveRecord || !cloudSaveRecord.save_data) {
      await uploadCloudSaveSnapshot(gameState);
      cloudSaveSyncEnabled = true;
      cloudSaveBootstrapPromise = null;
      return false;
    }

    const existingCloudMeta = getCloudSaveMeta();
    const shouldApplyCloudSave =
      !existingCloudMeta ||
      existingCloudMeta.userId !== authenticatedUser.id ||
      existingCloudMeta.updatedAt !== cloudSaveRecord.updated_at;

    if (shouldApplyCloudSave) {
      const normalizedCloudSave = normalizeGameState(cloneJsonValue(cloudSaveRecord.save_data));
      Object.keys(gameState).forEach(function (key) {
        delete gameState[key];
      });
      Object.assign(gameState, normalizedCloudSave);
      saveGameState(gameState);
      setCloudSaveMeta({
        userId: authenticatedUser.id,
        updatedAt: cloudSaveRecord.updated_at
      });
      cloudSaveSyncEnabled = true;

      if (typeof initOptions.onCloudLoad === "function") {
        initOptions.onCloudLoad(gameState);
      }

      if (initOptions.reloadOnRemoteLoad && typeof window !== "undefined" && window.location) {
        window.location.reload();
      }

      cloudSaveBootstrapPromise = null;
      return true;
    }

    cloudSaveSyncEnabled = true;
    await syncPlayerProfileToSupabase(gameState, new Date().toISOString());
    cloudSaveBootstrapPromise = null;
    return false;
  })().catch(function (error) {
    console.warn("Cloud save bootstrap failed", error);
    cloudSaveSyncEnabled = true;
    cloudSaveBootstrapPromise = null;
    return false;
  });

  return cloudSaveBootstrapPromise;
}

function generateRandomCode(codeLength) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let generatedCode = "";
  let randomBytes = null;

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    randomBytes = new Uint8Array(codeLength);
    crypto.getRandomValues(randomBytes);
  }

  for (let index = 0; index < codeLength; index += 1) {
    const randomValue = randomBytes ? randomBytes[index] : Math.floor(Math.random() * 256);
    generatedCode += alphabet[randomValue % alphabet.length];
  }

  return generatedCode;
}

function generatePlayerId() {
  return "PLAYER_" + generateRandomCode(16);
}

function generateFriendCode() {
  return generateRandomCode(12);
}

function normalizePlayerName(playerName) {
  if (typeof playerName !== "string") {
    return "Player";
  }

  const trimmedPlayerName = playerName.trim().replace(/\s+/g, " ");

  if (!trimmedPlayerName) {
    return "Player";
  }

  return trimmedPlayerName.slice(0, 24);
}

function ensurePlayerAccountIdentity(gameState) {
  if (!gameState.playerId) {
    gameState.playerId = generatePlayerId();
  }

  gameState.playerName = normalizePlayerName(gameState.playerName);

  if (!gameState.friendCode) {
    gameState.friendCode = generateFriendCode();
  } else {
    gameState.friendCode = gameState.friendCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

    if (!gameState.friendCode) {
      gameState.friendCode = generateFriendCode();
    }
  }
}

// Bird catalog and save-merging helpers
// Return a fresh copy of the bird catalog so save data can mutate safely.
function cloneBirdLibrary() {
  return BIRD_LIBRARY.map(function (bird) {
    return { ...bird };
  });
}

// Build a clean variant-count object for birds with multiple visual forms.
function createBirdVariantCounts(bird, totalCount) {
  if (!bird.variantImages) {
    return undefined;
  }

  const variantKeys = Object.keys(bird.variantImages);
  const variantCounts = {};

  variantKeys.forEach(function (variantKey) {
    variantCounts[variantKey] = 0;
  });

  if (totalCount > 0 && variantKeys.length > 0) {
    variantCounts[variantKeys[0]] = totalCount;
  }

  return variantCounts;
}

// Merge saved visual-variant counts onto the current bird definition.
function mergeBirdVariantCounts(bird, savedBird, totalCount) {
  if (!bird.variantImages) {
    return undefined;
  }

  const fallbackVariantCounts = createBirdVariantCounts(bird, totalCount);

  if (!savedBird || typeof savedBird.variantCounts !== "object" || savedBird.variantCounts === null) {
    return fallbackVariantCounts;
  }

  const mergedVariantCounts = {};
  let assignedCount = 0;

  Object.keys(bird.variantImages).forEach(function (variantKey) {
    const savedCount = typeof savedBird.variantCounts[variantKey] === "number"
      ? savedBird.variantCounts[variantKey]
      : 0;
    mergedVariantCounts[variantKey] = savedCount;
    assignedCount += savedCount;
  });

  if (assignedCount < totalCount) {
    const firstVariantKey = Object.keys(bird.variantImages)[0];
    mergedVariantCounts[firstVariantKey] += (totalCount - assignedCount);
  }

  return mergedVariantCounts;
}

// Merge saved bird progress onto the current bird catalog by stable id.
function mergeBirdProgress(savedBirds) {
  const savedBirdMap = new Map(
    (savedBirds || []).map(function (bird) {
      return [bird.id || bird.species, bird];
    })
  );

  return cloneBirdLibrary().map(function (bird) {
    const savedBird = savedBirdMap.get(bird.id) || savedBirdMap.get(bird.species);

    if (!savedBird) {
      return {
        ...bird,
        count: bird.acquired ? 1 : 0,
        variantCounts: createBirdVariantCounts(bird, bird.acquired ? 1 : 0)
      };
    }

    const mergedCount = typeof savedBird.count === "number"
      ? savedBird.count
      : ((typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired) ? 1 : 0);

    return {
      ...bird,
      acquired: typeof savedBird.acquired === "boolean" ? savedBird.acquired : bird.acquired,
      count: mergedCount,
      variantCounts: mergeBirdVariantCounts(bird, savedBird, mergedCount)
    };
  });
}

// Define the default save state for a brand new player.
function createDefaultGameState() {
  const defaultGameState = {
    ...cloneGameStateDefaults(),
    lastCoinUpdate: Date.now(),
    items: createDefaultItemCounts(),
    birds: createDefaultBirdProgress()
  };

  ensurePlayerAccountIdentity(defaultGameState);

  return defaultGameState;
}

// Persist the current game state to browser storage.
function saveGameState(gameState) {
  localStorage.setItem(STORAGE_KEY, serializeGameState(gameState));
  queueCloudSaveSync(gameState);
}

// Wipe the saved game from browser storage.
function eraseGameProgress() {
  localStorage.removeItem(STORAGE_KEY);
  clearCloudSaveMeta();
}

// Replace the current save with imported text from an exported file.
function importGameProgress(saveText) {
  const parsedGameState = normalizeGameState(parseSavedGameState(saveText));
  ensurePlayerAccountIdentity(parsedGameState);
  saveGameState(parsedGameState);
}

// Normalize imported or legacy save data against the current schema.
function normalizeGameState(parsedGameState) {
  const normalizedGameState = isPlainObject(parsedGameState) ? parsedGameState : {};

  // First repair every top-level field against the shared save schema so the
  // rest of the normalization logic can safely assume the field exists.
  Object.keys(GAME_STATE_DEFAULTS).forEach(function (key) {
    applyValidatedDefault(normalizedGameState, key);
  });

  if (!isFiniteNumber(normalizedGameState.lastCoinUpdate)) {
    normalizedGameState.lastCoinUpdate = Date.now();
  }

  if (normalizedGameState.shrikeQuestsCompleted < normalizedGameState.loggerheadQuestIndex) {
    normalizedGameState.shrikeQuestsCompleted = normalizedGameState.loggerheadQuestIndex;
  }

  ensurePlayerAccountIdentity(normalizedGameState);

  // Preserve the older single-field sawmill overseer save by copying it into
  // the newer per-process assignment object the rest of the game now uses.
  if (!isNullableString(normalizedGameState.overseerAssignments.sawmill)) {
    normalizedGameState.overseerAssignments.sawmill = normalizedGameState.sawmillOverseerId || null;
  }

  if (!isNullableString(normalizedGameState.overseerAssignments.dockyard)) {
    normalizedGameState.overseerAssignments.dockyard = null;
  }

  // The Dockyard shipped with a placeholder five-minute cycle before the real
  // one-hour voyage timing was chosen, so normalize old placeholder saves.
  if (normalizedGameState.dockyardVoyageDurationMs === 5 * 60 * 1000) {
    normalizedGameState.dockyardVoyageDurationMs = GAME_STATE_DEFAULTS.dockyardVoyageDurationMs;
  }

  // Older saves may have active sawmill state without the later
  // "constructed" boolean, so infer that unlock when any sawmill progress exists.
  if (
    !normalizedGameState.sawmillConstructed &&
    (
      normalizedGameState.sawmillProcessingActive ||
      normalizedGameState.sawmillProcessingReady ||
      normalizedGameState.sawmillProcessingPendingHardwood > 0 ||
      normalizedGameState.sawmillTwigThreshold > 0 ||
      normalizedGameState.overseerAssignments.sawmill !== null
    )
  ) {
    normalizedGameState.sawmillConstructed = true;
  }

  // Do the same style of recovery for the grub farm so older active saves do
  // not lose access to the system after importing or loading.
  if (!normalizedGameState.grubFarmUnlocked && normalizedGameState.grubFarmActive) {
    normalizedGameState.grubFarmUnlocked = true;
  }

  // Library-backed collections need to be rebuilt against the current catalog
  // so new birds and items appear while owned progress is preserved.
  normalizedGameState.items = mergeItemCounts(normalizedGameState.items);
  normalizedGameState.upgrades = mergeUpgradeOwnership(normalizedGameState.upgrades, normalizedGameState);
  normalizedGameState.birds = mergeBirdProgress(normalizedGameState.birds);

  // Clamp after every migration step so legacy overflows cannot leak back into
  // the running game state.
  clampGameStateResources(normalizedGameState);

  return normalizedGameState;
}

// Load and repair the saved game so older saves stay compatible.
function loadGameState() {
  const savedGameState = localStorage.getItem(STORAGE_KEY);

  if (!savedGameState) {
    const defaultGameState = createDefaultGameState();
    saveGameState(defaultGameState);
    return defaultGameState;
  }

  try {
    return normalizeGameState(parseSavedGameState(savedGameState));
  } catch (error) {
    const defaultGameState = createDefaultGameState();
    saveGameState(defaultGameState);
    return defaultGameState;
  }
}

// Per-bird stat helpers
// Return one upgrade definition by id from the shared catalogue.
function getUpgradeDefinition(upgradeId) {
  return UPGRADE_LIBRARY[upgradeId] || null;
}

// Check whether the current save owns one named upgrade.
function hasUpgrade(gameState, upgradeId) {
  return Boolean(gameState.upgrades && gameState.upgrades[upgradeId] === true);
}

// One-time upgrades should look inactive once purchased so players can tell at
// a glance that the button is informational rather than another action.
function isOwnedOneTimeUpgrade(gameState, upgradeId) {
  const upgradeDefinition = getUpgradeDefinition(upgradeId);

  return Boolean(
    upgradeDefinition &&
    upgradeDefinition.oneTime !== false &&
    hasUpgrade(gameState, upgradeId)
  );
}

// Apply the shared "owned and no longer clickable" state to upgrade buttons so
// each page does not need its own copy of the gray-out logic.
function syncOwnedUpgradeButtonState(button, gameState, upgradeId) {
  if (!button) {
    return;
  }

  const shouldGrayOut = isOwnedOneTimeUpgrade(gameState, upgradeId);
  button.classList.toggle("is-locked", shouldGrayOut);
  button.disabled = shouldGrayOut;
}

// Save or clear one upgrade's owned state while keeping the old boolean fields
// synced during the migration period.
function setUpgradeOwned(gameState, upgradeId, isOwned) {
  const upgradeDefinition = getUpgradeDefinition(upgradeId);

  if (!gameState.upgrades || typeof gameState.upgrades !== "object") {
    gameState.upgrades = createDefaultUpgradeOwnership();
  }

  gameState.upgrades[upgradeId] = isOwned === true;

  if (upgradeDefinition && typeof upgradeDefinition.legacyPurchasedKey === "string") {
    gameState[upgradeDefinition.legacyPurchasedKey] = isOwned === true;
  }
}

// Return every currently owned upgrade definition so shared calculation
// pipelines can scan for modifier hooks instead of hardcoded boolean checks.
function getOwnedUpgradeDefinitions(gameState) {
  if (!gameState.upgrades || typeof gameState.upgrades !== "object") {
    return [];
  }

  return Object.keys(gameState.upgrades).filter(function (upgradeId) {
    return gameState.upgrades[upgradeId] === true;
  }).map(function (upgradeId) {
    return getUpgradeDefinition(upgradeId);
  }).filter(Boolean);
}

// Check generic upgrade requirements stored in the catalogue.
function meetsUpgradeRequirements(gameState, upgradeDefinition) {
  const requirements = upgradeDefinition.requirements || {};

  if (
    typeof requirements.commonIndividuals === "number" &&
    getCaughtBirdCountByRarity(gameState, "Common") < requirements.commonIndividuals
  ) {
    return false;
  }

  if (
    typeof requirements.individuals === "number" &&
    getTotalBirdCount(gameState) < requirements.individuals
  ) {
    return false;
  }

  if (
    typeof requirements.species === "number" &&
    getFlockDiversity(gameState) < requirements.species
  ) {
    return false;
  }

  if (requirements.birds && typeof requirements.birds === "object") {
    const hasEnoughBirds = Object.keys(requirements.birds).every(function (birdId) {
      return getBirdCountById(gameState, birdId) >= requirements.birds[birdId];
    });

    if (!hasEnoughBirds) {
      return false;
    }
  }

  if (typeof upgradeDefinition.canPurchase === "function") {
    return upgradeDefinition.canPurchase(gameState);
  }

  return true;
}

// Check whether the player can currently pay the resource cost for one upgrade.
function canAffordUpgrade(gameState, upgradeDefinition) {
  const costs = upgradeDefinition.costs || {};

  return Object.keys(costs).every(function (resourceKey) {
    return gameState[resourceKey] >= costs[resourceKey];
  });
}

// Spend the generic resource cost object defined on an upgrade.
function spendUpgradeCosts(gameState, upgradeDefinition) {
  const costs = upgradeDefinition.costs || {};

  Object.keys(costs).forEach(function (resourceKey) {
    gameState[resourceKey] -= costs[resourceKey];
  });
}

// Purchase one upgrade from the catalogue and run any one-time side effects it
// defines, returning true only when the purchase succeeds.
function purchaseUpgrade(gameState, upgradeId) {
  const upgradeDefinition = getUpgradeDefinition(upgradeId);

  if (!upgradeDefinition) {
    return false;
  }

  if (upgradeDefinition.oneTime !== false && hasUpgrade(gameState, upgradeId)) {
    return false;
  }

  if (!meetsUpgradeRequirements(gameState, upgradeDefinition) || !canAffordUpgrade(gameState, upgradeDefinition)) {
    return false;
  }

  spendUpgradeCosts(gameState, upgradeDefinition);
  setUpgradeOwned(gameState, upgradeId, true);

  if (typeof upgradeDefinition.onPurchase === "function") {
    upgradeDefinition.onPurchase(gameState);
  }

  clampGameStateResources(gameState);
  return true;
}

let sharedUpgradeUiInitialized = false;
let sharedUpgradeDialogState = null;

// Build shared cost text for upgrade tooltips and confirmation copy.
function getUpgradeCostSummary(upgradeDefinition) {
  const costs = upgradeDefinition && upgradeDefinition.costs ? upgradeDefinition.costs : {};

  return Object.keys(costs).map(function (resourceKey) {
    const resourceLabel = resourceKey.charAt(0).toUpperCase() + resourceKey.slice(1);
    return formatLargeNumber(costs[resourceKey]) + " " + resourceLabel;
  }).join(" | ");
}

// Build shared requirement text for upgrade tooltips and confirmation copy.
function getUpgradeRequirementSummary(gameState, upgradeDefinition) {
  const requirements = upgradeDefinition && upgradeDefinition.requirements ? upgradeDefinition.requirements : {};
  const requirementParts = [];

  if (typeof requirements.commonIndividuals === "number") {
    requirementParts.push(formatLargeNumber(requirements.commonIndividuals) + " Common Birds");
  }

  if (typeof requirements.individuals === "number") {
    requirementParts.push(formatLargeNumber(requirements.individuals) + " Individuals");
  }

  if (typeof requirements.species === "number") {
    requirementParts.push(formatLargeNumber(requirements.species) + " Species");
  }

  if (requirements.birds && typeof requirements.birds === "object") {
    Object.keys(requirements.birds).forEach(function (birdId) {
      const bird = getBirdById(gameState, birdId);
      requirementParts.push(
        formatLargeNumber(requirements.birds[birdId]) + " " + (bird ? bird.species : birdId)
      );
    });
  }

  return requirementParts.join(" | ");
}

// Keep upgrade hover tooltips disabled when the mobile-friendly confirmation
// flow is enabled, without affecting unrelated tooltip systems.
function syncUpgradeInteractionPreference(gameState) {
  if (!document || !document.body) {
    return;
  }

  document.body.classList.toggle("upgrade-tooltips-disabled", gameState.upgradeConfirmationEnabled === true);
}

// Create the shared upgrade-confirmation overlay on demand so pages with
// upgrades can reuse one consistent purchase flow.
function ensureSharedUpgradeUi() {
  if (sharedUpgradeUiInitialized || !document || !document.body) {
    return;
  }

  sharedUpgradeUiInitialized = true;

  const styleElement = document.createElement("style");
  styleElement.textContent =
    ".upgrade-tooltip{position:relative;display:inline-block;}" +
    ".upgrade-tooltip-box{position:absolute;top:calc(100% + 8px);left:0;background:#f7f1e6;color:#1f2a36;border:2px solid black;border-radius:10px;padding:10px 12px;min-width:220px;white-space:normal;visibility:hidden;opacity:0;transition:opacity 0.15s ease;z-index:10;}" +
    ".upgrade-tooltip:hover .upgrade-tooltip-box{visibility:visible;opacity:1;}" +
    ".upgrade-tooltips-disabled .upgrade-tooltip-box{visibility:hidden !important;opacity:0 !important;display:none !important;}" +
    ".upgrade-confirm-overlay{position:fixed;inset:0;background:rgba(31,42,54,0.82);display:none;align-items:center;justify-content:center;z-index:400;padding:24px;box-sizing:border-box;}" +
    ".upgrade-confirm-overlay.is-visible{display:flex;}" +
    ".upgrade-confirm-card{width:100%;max-width:520px;background:#f7f1e6;border:3px solid black;border-radius:20px;padding:24px;box-sizing:border-box;}" +
    ".upgrade-confirm-title{margin:0 0 12px;color:#2c3e50;}" +
    ".upgrade-confirm-text{margin:0 0 12px;color:#2c3e50;font-weight:bold;}" +
    ".upgrade-confirm-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;}";
  document.head.appendChild(styleElement);

  const overlay = document.createElement("div");
  overlay.className = "upgrade-confirm-overlay";
  overlay.innerHTML =
    "<div class='upgrade-confirm-card'>" +
      "<h2 class='upgrade-confirm-title' id='sharedUpgradeConfirmTitle'></h2>" +
      "<p class='upgrade-confirm-text' id='sharedUpgradeConfirmDescription'></p>" +
      "<p class='upgrade-confirm-text' id='sharedUpgradeConfirmCosts'></p>" +
      "<p class='upgrade-confirm-text' id='sharedUpgradeConfirmRequirements'></p>" +
      "<div class='upgrade-confirm-actions'>" +
        "<button class='action-button' type='button' id='sharedUpgradeConfirmButton'>Confirm Purchase</button>" +
        "<button class='back-link' type='button' id='sharedUpgradeCancelButton'>Cancel</button>" +
      "</div>" +
    "</div>";
  document.body.appendChild(overlay);

  sharedUpgradeDialogState = {
    overlay: overlay,
    title: overlay.querySelector("#sharedUpgradeConfirmTitle"),
    description: overlay.querySelector("#sharedUpgradeConfirmDescription"),
    costs: overlay.querySelector("#sharedUpgradeConfirmCosts"),
    requirements: overlay.querySelector("#sharedUpgradeConfirmRequirements"),
    confirmButton: overlay.querySelector("#sharedUpgradeConfirmButton"),
    cancelButton: overlay.querySelector("#sharedUpgradeCancelButton")
  };

  function closeSharedUpgradeDialog() {
    overlay.classList.remove("is-visible");
    sharedUpgradeDialogState.confirmButton.onclick = null;
  }

  sharedUpgradeDialogState.cancelButton.addEventListener("click", closeSharedUpgradeDialog);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeSharedUpgradeDialog();
    }
  });

  sharedUpgradeDialogState.close = closeSharedUpgradeDialog;
}

// Route upgrade purchases through an optional confirmation modal for mobile,
// while keeping desktop hover-tooltips as the default behavior.
function handleUpgradePurchaseRequest(gameState, upgradeId, options) {
  const upgradeDefinition = getUpgradeDefinition(upgradeId);
  const purchaseOptions = options || {};

  if (!upgradeDefinition) {
    return false;
  }

  function performPurchase() {
    if (typeof purchaseOptions.beforePurchase === "function") {
      purchaseOptions.beforePurchase();
    }

    if (!purchaseUpgrade(gameState, upgradeId)) {
      if (typeof purchaseOptions.onFailure === "function") {
        purchaseOptions.onFailure();
      }
      return false;
    }

    playButtonSound();
    saveGameState(gameState);

    if (typeof purchaseOptions.onSuccess === "function") {
      purchaseOptions.onSuccess();
    }

    return true;
  }

  if (gameState.upgradeConfirmationEnabled !== true) {
    return performPurchase();
  }

  ensureSharedUpgradeUi();
  syncUpgradeInteractionPreference(gameState);

  sharedUpgradeDialogState.title.textContent = upgradeDefinition.name;
  sharedUpgradeDialogState.description.textContent = upgradeDefinition.description || "No description available";
  sharedUpgradeDialogState.costs.textContent = getUpgradeCostSummary(upgradeDefinition)
    ? "Cost: " + getUpgradeCostSummary(upgradeDefinition)
    : "Cost: None";
  sharedUpgradeDialogState.requirements.textContent = getUpgradeRequirementSummary(gameState, upgradeDefinition)
    ? "Requires: " + getUpgradeRequirementSummary(gameState, upgradeDefinition)
    : "Requires: None";

  sharedUpgradeDialogState.confirmButton.onclick = function () {
    performPurchase();
    sharedUpgradeDialogState.close();
  };

  sharedUpgradeDialogState.overlay.classList.add("is-visible");
  return false;
}

// Allow selected high-frequency action buttons to repeat while held.
// This is opt-in per button so purchases and navigation do not accidentally spam.
function attachHoldToClick(button, gameState, options) {
  if (!button || button.dataset.holdToClickBound === "true") {
    return;
  }

  const holdOptions = options || {};
  const startDelayMs = typeof holdOptions.startDelayMs === "number" ? holdOptions.startDelayMs : 300;
  const intervalMs = typeof holdOptions.intervalMs === "number" ? holdOptions.intervalMs : 333;
  const repeatAction = typeof holdOptions.repeatAction === "function" ? holdOptions.repeatAction : null;
  let holdTimeoutId = null;
  let holdIntervalId = null;
  let holdActive = false;
  let suppressClickUntilMs = 0;

  button.dataset.holdToClickBound = "true";

  function isHoldToClickEnabled() {
    if (gameState.holdToClickEnabled === true) {
      return true;
    }

    try {
      return loadGameState().holdToClickEnabled === true;
    } catch (error) {
      return false;
    }
  }

  function clearHoldTimers() {
    if (holdTimeoutId !== null) {
      clearTimeout(holdTimeoutId);
      holdTimeoutId = null;
    }

    if (holdIntervalId !== null) {
      clearInterval(holdIntervalId);
      holdIntervalId = null;
    }
  }

  function stopHold() {
    clearHoldTimers();
    holdActive = false;
  }

  function runRepeatAction() {
    if (button.disabled) {
      stopHold();
      return;
    }

    suppressClickUntilMs = Date.now() + 500;

    if (repeatAction) {
      repeatAction();
      return;
    }

    button.click();
  }

  function startHold() {
    if (holdActive || !isHoldToClickEnabled() || button.disabled) {
      return;
    }

    holdActive = true;
    suppressClickUntilMs = 0;
    clearHoldTimers();

    holdTimeoutId = setTimeout(function () {
      runRepeatAction();
      holdIntervalId = setInterval(runRepeatAction, intervalMs);
    }, startDelayMs);
  }

  function handlePressStart(event) {
    if (event.type === "mousedown" && event.button !== 0) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    startHold();
  }

  function handlePressEnd() {
    if (!holdActive) {
      return;
    }

    stopHold();
  }

  button.addEventListener("click", function (event) {
    if (Date.now() > suppressClickUntilMs) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  button.addEventListener("mousedown", handlePressStart);
  button.addEventListener("touchstart", handlePressStart, { passive: false });

  button.addEventListener("mouseup", handlePressEnd);
  button.addEventListener("mouseleave", handlePressEnd);
  button.addEventListener("touchend", handlePressEnd, { passive: true });
  button.addEventListener("touchcancel", handlePressEnd, { passive: true });
  window.addEventListener("mouseup", handlePressEnd);
  window.addEventListener("touchend", handlePressEnd, { passive: true });
  window.addEventListener("touchcancel", handlePressEnd, { passive: true });

  button.addEventListener("contextmenu", function (event) {
    if (holdActive) {
      event.preventDefault();
    }
  });

  button.addEventListener("blur", handlePressEnd);
}

// Read one numeric bird field, defaulting to zero when the species does not
// naturally define that property in birds.js.
function getBirdNumericPropertyValue(bird, propertyKey) {
  return typeof bird[propertyKey] === "number" ? bird[propertyKey] : 0;
}

// Resolve one bird stat while honoring parasite targeting and guarding against
// circular target chains if future content ever points two parasite birds at
// each other.
function getResolvedBirdNumericProperty(bird, gameState, propertyKey, visitedBirdIds, applyModifiers) {
  const visitedIds = Array.isArray(visitedBirdIds) ? visitedBirdIds : [];
  const parasiteTargetBird = getParasiteTargetBird(bird, gameState);

  if (parasiteTargetBird) {
    if (visitedIds.includes(bird.id)) {
      return getBirdNumericPropertyValue(bird, propertyKey);
    }

    return getResolvedBirdNumericProperty(
      parasiteTargetBird,
      gameState,
      propertyKey,
      visitedIds.concat(bird.id),
      applyModifiers
    );
  }

  let resolvedValue = getBirdNumericPropertyValue(bird, propertyKey);

  if (typeof applyModifiers === "function") {
    resolvedValue = applyModifiers(resolvedValue, bird, gameState);
  }

  return resolvedValue;
}

// Apply per-species visitor modifiers from aviary upgrades.
function getBirdVisitorRatePerDay(bird, gameState, visitedBirdIds) {
  return getResolvedBirdNumericProperty(
    bird,
    gameState,
    "visitorsPerDay",
    visitedBirdIds,
    function (visitorRate, resolvedBird, resolvedGameState) {
      if (Array.isArray(resolvedBird.abilities)) {
        resolvedBird.abilities.forEach(function (abilityId) {
          const ability = ABILITIES[abilityId];

          if (!ability || typeof ability.modifyVisitorsPerDay !== "function") {
            return;
          }

          visitorRate = ability.modifyVisitorsPerDay(visitorRate, {
            bird: resolvedBird,
            gameState: resolvedGameState,
            totalIndividuals: resolvedBird.count
          });
        });
      }

      getOwnedUpgradeDefinitions(resolvedGameState).forEach(function (upgrade) {
        if (typeof upgrade.modifyVisitorsPerDay === "function") {
          visitorRate = upgrade.modifyVisitorsPerDay(visitorRate, {
            bird: resolvedBird,
            gameState: resolvedGameState
          });
        }
      });

      return visitorRate;
    }
  );
}

// Return only birds the player currently owns.
function getAcquiredBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return (typeof bird.count === "number" ? bird.count > 0 : bird.acquired === true);
  });
}

// Sum total visitors/day across all owned individual birds.
function getVisitorsPerDay(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + getBirdVisitorRatePerDay(bird, gameState) * bird.count;
  }, 0);
}

// Count unique acquired species for overview and top-bar display.
function getFlockDiversity(gameState) {
  return new Set(
    getAcquiredBirds(gameState).map(function (bird) {
      return bird.species;
    })
  ).size;
}

// Earthworks unlocks once the flock reaches four unique species.
function isEarthworksUnlocked(gameState) {
  return getFlockDiversity(gameState) >= 4;
}

// Dockyard unlocks once Urban Waters has been constructed.
function isDockyardUnlocked(gameState) {
  return Array.isArray(gameState.ownedHabitats) && gameState.ownedHabitats.includes("Urban Waters");
}

// Build the current catch pool from birds tied to owned habitats.
function getCatchableBirds(gameState) {
  return gameState.birds.filter(function (bird) {
    return gameState.ownedHabitats.includes(bird.nativeHabitat);
  });
}

// Check whether a bird currently has one named ability.
function birdHasAbility(bird, abilityId) {
  return Array.isArray(bird.abilities) && bird.abilities.includes(abilityId);
}

// Track how far a parasite bird has expanded its allowed target rarities.
function getParasiteTargetTier(gameState, birdId) {
  if (!gameState.parasiteUpgradeTiers || typeof gameState.parasiteUpgradeTiers !== "object") {
    return 0;
  }

  const savedTier = gameState.parasiteUpgradeTiers[birdId];
  return isFiniteNumber(savedTier) ? Math.max(0, Math.floor(savedTier)) : 0;
}

// Convert a parasite tier into the highest rarity index it can currently copy.
function getParasiteMaxRarityIndex(gameState, birdId) {
  return Math.min(getParasiteTargetTier(gameState, birdId), 3);
}

// Track how far a predator bird has expanded its maximum seed-bait bonus cap.
function getPredatorUpgradeTier(gameState, birdId) {
  if (!gameState.predatorUpgradeTiers || typeof gameState.predatorUpgradeTiers !== "object") {
    return 0;
  }

  const savedTier = gameState.predatorUpgradeTiers[birdId];
  return isFiniteNumber(savedTier) ? Math.max(0, Math.floor(savedTier)) : 0;
}

// Return the current seed-bait catch-rate cap for one predator species.
function getPredatorMaxBonus(gameState, birdId) {
  const predatorAbility = ABILITIES.predator || {};
  const baseMaxBonus = typeof predatorAbility.baseMaxBonus === "number"
    ? predatorAbility.baseMaxBonus
    : 0.1;
  const upgradeBonusStep = typeof predatorAbility.upgradeBonusStep === "number"
    ? predatorAbility.upgradeBonusStep
    : 0.05;

  return baseMaxBonus + (getPredatorUpgradeTier(gameState, birdId) * upgradeBonusStep);
}

// Sum the seed-bait catch-rate bonus granted by all owned predator species.
function getPredatorCatchRateBonus(gameState, baitType) {
  if (baitType !== "seeds") {
    return 0;
  }

  return getAcquiredBirdsWithAbility(gameState, "predator").reduce(function (totalBonus, bird) {
    const speciesBonus = Math.min(bird.count * 0.02, getPredatorMaxBonus(gameState, bird.id));
    return totalBonus + speciesBonus;
  }, 0);
}

// Return the currently eligible target species a parasite bird can copy from.
function getParasiteEligibleTargetBirds(parasiticBird, gameState) {
  if (!birdHasAbility(parasiticBird, "parasite")) {
    return [];
  }

  const maxRarityIndex = getParasiteMaxRarityIndex(gameState, parasiticBird.id);

  return getAcquiredBirds(gameState).filter(function (candidateBird) {
    const candidateRarityIndex = RARITY_ORDER.indexOf(candidateBird.rarity);

    if (
      candidateBird.id === parasiticBird.id ||
      candidateBird.nativeHabitat !== parasiticBird.nativeHabitat ||
      birdHasAbility(candidateBird, "parasite") ||
      candidateRarityIndex === -1
    ) {
      return false;
    }

    return candidateRarityIndex <= maxRarityIndex;
  }).sort(compareBirdsByRarityThenSpecies);
}

// Read the saved parasite target id for one parasitic species.
function getParasiteTargetId(gameState, birdId) {
  if (!gameState.parasiteTargets || typeof gameState.parasiteTargets !== "object") {
    return null;
  }

  return gameState.parasiteTargets[birdId] || null;
}

// Save or clear the parasite target for one parasitic species.
function setParasiteTargetId(gameState, birdId, targetBirdId) {
  if (!gameState.parasiteTargets || typeof gameState.parasiteTargets !== "object") {
    gameState.parasiteTargets = {};
  }

  if (targetBirdId === null) {
    delete gameState.parasiteTargets[birdId];
    return;
  }

  gameState.parasiteTargets[birdId] = targetBirdId;
}

// Return the active parasite target only if it is still valid and eligible.
function getParasiteTargetBird(parasiticBird, gameState) {
  const targetBirdId = getParasiteTargetId(gameState, parasiticBird.id);

  if (!targetBirdId) {
    return null;
  }

  return getParasiteEligibleTargetBirds(parasiticBird, gameState).find(function (candidateBird) {
    return candidateBird.id === targetBirdId;
  }) || null;
}

// Support both single-diet birds and future birds that can eat multiple bait types.
function birdMatchesBaitType(bird, baitType) {
  const normalizedBaitType = typeof baitType === "string" ? baitType.toLowerCase() : "";

  if (Array.isArray(bird.diet)) {
    return bird.diet.some(function (dietType) {
      return typeof dietType === "string" && dietType.toLowerCase() === normalizedBaitType;
    });
  }

  return typeof bird.diet === "string" && bird.diet.toLowerCase() === normalizedBaitType;
}

// Filter the habitat catch pool by the bait diet that was loaded into the trap.
function getCatchableBirdsByDiet(gameState, baitType) {
  return getCatchableBirds(gameState).filter(function (bird) {
    return birdMatchesBaitType(bird, baitType);
  });
}

// Build the full special-catch pool for mice-fed birds of prey.
function getBirdsByDiet(gameState, dietType) {
  return gameState.birds.filter(function (bird) {
    return birdMatchesBaitType(bird, dietType);
  });
}

// Split the mouse pool into first-time catches and already-owned repeats.
function getMouseCatchPools(gameState) {
  const mouseBirds = getBirdsByDiet(gameState, "mice");

  return {
    newSpeciesBirds: mouseBirds.filter(function (bird) {
      return bird.count <= 0;
    }),
    repeatBirds: mouseBirds.filter(function (bird) {
      return bird.count > 0;
    })
  };
}

// Resolve the special 100% mouse-catch roll between new-species and repeat pools.
function getRandomMouseCatchBird(gameState) {
  const mouseCatchPools = getMouseCatchPools(gameState);
  let selectedPool = [];

  if (mouseCatchPools.newSpeciesBirds.length === 0 && mouseCatchPools.repeatBirds.length === 0) {
    return null;
  }

  if (mouseCatchPools.newSpeciesBirds.length === 0) {
    selectedPool = mouseCatchPools.repeatBirds;
  } else if (mouseCatchPools.repeatBirds.length === 0) {
    selectedPool = mouseCatchPools.newSpeciesBirds;
  } else {
    selectedPool = Math.random() < 0.5
      ? mouseCatchPools.newSpeciesBirds
      : mouseCatchPools.repeatBirds;
  }

  return getRandomBirdByRarityForGameState(selectedPool, gameState);
}

// Format one readable diet label for UI whether the bird has one diet or many.
function formatBirdDietLabel(bird) {
  if (Array.isArray(bird.diet)) {
    return bird.diet.join(", ");
  }

  return bird.diet || "";
}

// Count owned individuals in a specific rarity bucket.
function getCaughtBirdCountByRarity(gameState, rarityName) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (bird.rarity !== rarityName) {
      return total;
    }

    return total + bird.count;
  }, 0);
}

// Report how full a habitat collection is for the header labels.
function getHabitatBirdTotals(gameState, habitatName) {
  const totalSpecies = gameState.birds.filter(function (bird) {
    return bird.nativeHabitat === habitatName;
  }).length;

  const acquiredSpecies = gameState.birds.filter(function (bird) {
    return bird.nativeHabitat === habitatName && bird.acquired;
  }).length;

  return {
    acquiredSpecies: acquiredSpecies,
    totalSpecies: totalSpecies
  };
}

// Return every habitat represented in the current bird library and owned save data.
function getAllHabitatNames(gameState) {
  const habitatNames = [];

  gameState.birds.forEach(function (bird) {
    if (typeof bird.nativeHabitat === "string" && !habitatNames.includes(bird.nativeHabitat)) {
      habitatNames.push(bird.nativeHabitat);
    }
  });

  gameState.ownedHabitats.forEach(function (habitatName) {
    if (typeof habitatName === "string" && !habitatNames.includes(habitatName)) {
      habitatNames.push(habitatName);
    }
  });

  return habitatNames;
}

// Count total individual birds, including duplicates of one species.
function getTotalBirdCount(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + bird.count;
  }, 0);
}

// Count how many habitats have been fully completed.
function getCompletedHabitatCount(gameState) {
  return gameState.ownedHabitats.reduce(function (total, habitatName) {
    const habitatTotals = getHabitatBirdTotals(gameState, habitatName);

    if (habitatTotals.totalSpecies > 0 && habitatTotals.acquiredSpecies === habitatTotals.totalSpecies) {
      return total + 1;
    }

    return total;
  }, 0);
}

// Calculate social leaderboard points from the current save.
function getPoints(gameState) {
  const speciesPoints = Math.max(0, getFlockDiversity(gameState) - 1) * 50;
  const commonPoints = Math.max(0, getCaughtBirdCountByRarity(gameState, "Common") - 1) * 1;
  const uncommonPoints = getCaughtBirdCountByRarity(gameState, "Uncommon") * 3;
  const rarePoints = getCaughtBirdCountByRarity(gameState, "Rare") * 5;
  const epicPoints = getCaughtBirdCountByRarity(gameState, "Epic") * 10;
  const legendaryPoints = getCaughtBirdCountByRarity(gameState, "Legendary") * 25;
  const habitatCompletionPoints = getCompletedHabitatCount(gameState) * 100;
  const constructedHabitatPoints = Math.max(0, gameState.ownedHabitats.length - 1) * 50;
  const shrikeQuestPoints = gameState.shrikeQuestsCompleted * 25;

  return (
    speciesPoints +
    commonPoints +
    uncommonPoints +
    rarePoints +
    epicPoints +
    legendaryPoints +
    habitatCompletionPoints +
    constructedHabitatPoints +
    shrikeQuestPoints
  );
}

// Apply per-species twig modifiers from aviary upgrades.
function getBirdTwigRatePerSecond(bird, gameState, visitedBirdIds) {
  return getResolvedBirdNumericProperty(
    bird,
    gameState,
    "twigsPerSecond",
    visitedBirdIds,
    function (twigRate, resolvedBird, resolvedGameState) {
      getOwnedUpgradeDefinitions(resolvedGameState).forEach(function (upgrade) {
        if (typeof upgrade.modifyTwigRatePerSecond === "function") {
          twigRate = upgrade.modifyTwigRatePerSecond(twigRate, {
            bird: resolvedBird,
            gameState: resolvedGameState
          });
        }
      });

      return twigRate;
    }
  );
}

// Return a bird's passive seed income, defaulting to zero when absent.
function getBirdSeedRatePerSecond(bird, gameState, visitedBirdIds) {
  return getResolvedBirdNumericProperty(
    bird,
    gameState,
    "seedsPerSecond",
    visitedBirdIds,
    function (seedRate, resolvedBird, resolvedGameState) {
      getOwnedUpgradeDefinitions(resolvedGameState).forEach(function (upgrade) {
        if (typeof upgrade.modifySeedRatePerSecond === "function") {
          seedRate = upgrade.modifySeedRatePerSecond(seedRate, {
            bird: resolvedBird,
            gameState: resolvedGameState
          });
        }
      });

      return seedRate;
    }
  );
}

// Return a bird's passive grub income, defaulting to zero when absent.
function getBirdGrubRatePerSecond(bird, gameState, visitedBirdIds) {
  return getResolvedBirdNumericProperty(bird, gameState, "grubsPerSecond", visitedBirdIds);
}

// Return one bird's orchard-cap bonus for the requested tree type.
function getBirdTreeBonusValue(bird, gameState, treeBonusKey, visitedBirdIds) {
  return getResolvedBirdNumericProperty(bird, gameState, treeBonusKey, visitedBirdIds);
}

// Keep explicit wrappers for readability at call sites that are naturally tied
// to one orchard type.
function getBirdBonusAppleTree(bird, gameState, visitedBirdIds) {
  return getBirdTreeBonusValue(bird, gameState, "bonusAppleTree", visitedBirdIds);
}

function getBirdBonusPearTree(bird, gameState, visitedBirdIds) {
  return getBirdTreeBonusValue(bird, gameState, "bonusPearTree", visitedBirdIds);
}

function getBirdBonusPeachTree(bird, gameState, visitedBirdIds) {
  return getBirdTreeBonusValue(bird, gameState, "bonusPeachTree", visitedBirdIds);
}

function getBirdBonusOrangeTree(bird, gameState, visitedBirdIds) {
  return getBirdTreeBonusValue(bird, gameState, "bonusOrangeTree", visitedBirdIds);
}

const BIRD_RESOURCE_DEFINITIONS = [
  {
    key: "visitorsPerDay",
    label: "Visitors Per Day",
    getValue: function (bird, gameState) {
      return getBirdVisitorRatePerDay(bird, gameState);
    }
  },
  {
    key: "grubsPerSecond",
    label: "Grubs Per Second",
    getValue: function (bird, gameState) {
      return getBirdGrubRatePerSecond(bird, gameState);
    }
  },
  {
    key: "twigsPerSecond",
    label: "Twigs Per Second",
    getValue: function (bird, gameState) {
      return getBirdTwigRatePerSecond(bird, gameState);
    }
  },
  {
    key: "seedsPerSecond",
    label: "Seeds Per Second",
    getValue: function (bird, gameState) {
      return getBirdSeedRatePerSecond(bird, gameState);
    }
  },
  {
    key: "bonusAppleTree",
    label: "Bonus Apple Trees",
    getValue: function (bird, gameState) {
      return getBirdBonusAppleTree(bird, gameState);
    }
  },
  {
    key: "bonusPearTree",
    label: "Bonus Pear Trees",
    getValue: function (bird, gameState) {
      return getBirdBonusPearTree(bird, gameState);
    }
  },
    {
      key: "bonusPeachTree",
      label: "Bonus Peach Trees",
      getValue: function (bird, gameState) {
        return getBirdBonusPeachTree(bird, gameState);
      }
    },
    {
      key: "bonusOrangeTree",
      label: "Bonus Orange Trees",
      getValue: function (bird, gameState) {
        return getBirdBonusOrangeTree(bird, gameState);
      }
    }
  ];

// Return the fixed resource trade used by the grub farm when active.
function getGrubFarmRates(gameState) {
  if (!gameState.grubFarmActive) {
    return {
      seedsPerSecond: 0,
      twigsPerSecond: 0,
      grubsPerSecond: 0
    };
  }

  return {
    seedsPerSecond: 15,
    twigsPerSecond: 1,
    grubsPerSecond: 0.5
  };
}

// Turn a millisecond duration into a compact human-readable label.
function formatDurationLabel(durationMs) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return hours + "h " + minutes + "m";
    }

    return hours + "h";
  }

  if (minutes > 0) {
    if (seconds > 0) {
      return minutes + "m " + seconds + "s";
    }

    return minutes + "m";
  }

  return seconds + "s";
}

// Return the remaining time on the active sawmill batch.
function getSawmillRemainingMs(gameState, currentTime) {
  if (!gameState.sawmillProcessingActive || gameState.sawmillProcessingReady || gameState.sawmillProcessingStart === null) {
    return 0;
  }

  const elapsedMs = currentTime - gameState.sawmillProcessingStart;
  return Math.max(0, getSawmillProcessingDurationMs(gameState) - elapsedMs);
}

// Advance sawmill processing based on real time.
function updateSawmillProcessingState(gameState, currentTime) {
  if (!gameState.sawmillProcessingActive || gameState.sawmillProcessingReady || gameState.sawmillProcessingStart === null) {
    return false;
  }

  if (getSawmillRemainingMs(gameState, currentTime) > 0) {
    return false;
  }

  gameState.sawmillProcessingReady = true;
  saveGameState(gameState);
  return true;
}

// Start a new automated sawmill batch when an overseer is assigned and the
// minimum twig reserve has been met.
function tryAutoStartSawmill(gameState, currentTime) {
  if (
    gameState.sawmillProcessingActive ||
    gameState.sawmillProcessingReady ||
    !getAssignedOverseerId(gameState, "sawmill") ||
    gameState.sawmillTwigThreshold <= 0
  ) {
    return false;
  }

  const processingCost = getSawmillTwigProcessingCost(gameState);
  const minimumTwigRequirement = Math.max(processingCost, gameState.sawmillTwigThreshold);

  if (gameState.twigs < minimumTwigRequirement) {
    return false;
  }

  gameState.twigs -= processingCost;
  gameState.sawmillProcessingStart = currentTime;
  gameState.sawmillProcessingPendingHardwood = 10;
  gameState.sawmillProcessingActive = true;
  gameState.sawmillProcessingReady = false;
  return true;
}

// Let the sawmill overseer collect finished hardwood and immediately queue the
// next batch whenever the saved threshold still allows it.
function runSawmillAutomation(gameState, currentTime) {
  let didChange = false;

  if (!getAssignedOverseerId(gameState, "sawmill") || gameState.sawmillTwigThreshold <= 0) {
    return false;
  }

  if (gameState.sawmillProcessingReady) {
    gameState.hardwood = addPassiveResourceWithCap(
      gameState.hardwood,
      gameState.hardwoodMax,
      gameState.sawmillProcessingPendingHardwood
    );
    gameState.sawmillProcessingPendingHardwood = 0;
    gameState.sawmillProcessingStart = null;
    gameState.sawmillProcessingActive = false;
    gameState.sawmillProcessingReady = false;
    didChange = true;
  }

  if (tryAutoStartSawmill(gameState, currentTime)) {
    didChange = true;
  }

  return didChange;
}

function addPassiveResourceWithCap(currentValue, maxValue, amountToAdd) {
  const safeCurrentValue = isFiniteNumber(currentValue) ? currentValue : 0;
  const safeMaxValue = isFiniteNumber(maxValue) ? maxValue : safeCurrentValue;
  const safeAmountToAdd = isFiniteNumber(amountToAdd) ? amountToAdd : 0;

  return Math.max(0, Math.min(safeMaxValue, safeCurrentValue + safeAmountToAdd));
}

// Return how long remains on an active Dockyard voyage.
function getDockyardRemainingMs(gameState, currentTime) {
  if (!gameState.dockyardVoyageActive || gameState.dockyardVoyageReady || gameState.dockyardVoyageStart === null) {
    return 0;
  }

  const elapsedMs = currentTime - gameState.dockyardVoyageStart;
  return Math.max(0, gameState.dockyardVoyageDurationMs - elapsedMs);
}

// Advance Dockyard voyage progress from elapsed real time.
function updateDockyardVoyageState(gameState, currentTime) {
  if (!gameState.dockyardVoyageActive || gameState.dockyardVoyageReady || gameState.dockyardVoyageStart === null) {
    return false;
  }

  if (getDockyardRemainingMs(gameState, currentTime) > 0) {
    return false;
  }

  gameState.dockyardVoyageReady = true;
  return true;
}

// Roll one treasure entry from the current Dockyard reward table using its
// configured weights so the pool can grow later without changing callers.
function getRandomDockyardTreasureReward() {
  const totalWeight = DOCKYARD_TREASURE_REWARD_TABLE.reduce(function (weightSum, rewardEntry) {
    return weightSum + (rewardEntry.weight || 0);
  }, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let remainingWeight = Math.random() * totalWeight;

  for (let index = 0; index < DOCKYARD_TREASURE_REWARD_TABLE.length; index += 1) {
    const rewardEntry = DOCKYARD_TREASURE_REWARD_TABLE[index];
    remainingWeight -= rewardEntry.weight || 0;

    if (remainingWeight <= 0) {
      return rewardEntry;
    }
  }

  return DOCKYARD_TREASURE_REWARD_TABLE[DOCKYARD_TREASURE_REWARD_TABLE.length - 1] || null;
}

// Build the treasure bundle waiting at the end of one Dockyard voyage.
function rollDockyardTreasureRewards(gameState) {
  const pendingRewards = {};
  const treasureChance = getDockyardTreasureChance(gameState);

  if (Math.random() >= treasureChance) {
    return pendingRewards;
  }

  const rewardCount = Math.floor(Math.random() * 4) + 1;

  for (let rewardIndex = 0; rewardIndex < rewardCount; rewardIndex += 1) {
    const rewardEntry = getRandomDockyardTreasureReward();

    if (!rewardEntry) {
      continue;
    }

    if (rewardEntry.type === "item" && rewardEntry.itemId) {
      pendingRewards[rewardEntry.itemId] = (pendingRewards[rewardEntry.itemId] || 0) + rewardEntry.amount;
    } else if ((rewardEntry.type === "resource" || rewardEntry.type === "currency") && rewardEntry.resourceKey) {
      pendingRewards[rewardEntry.resourceKey] = (pendingRewards[rewardEntry.resourceKey] || 0) + rewardEntry.amount;
    }
  }

  return pendingRewards;
}

// Start one Dockyard voyage and capture its reward bundle up front so the
// eventual return state is deterministic once the boat leaves harbor.
function startDockyardVoyage(gameState, currentTime) {
  if (gameState.coins < 100000) {
    return false;
  }

  gameState.coins -= 100000;
  gameState.dockyardVoyageStart = currentTime;
  gameState.dockyardVoyageActive = true;
  gameState.dockyardVoyageReady = false;
  gameState.dockyardVoyagePendingFish = getEffectiveFishPerVoyage(gameState);
  gameState.dockyardVoyagePendingScrap = gameState.dockyardScrapPerVoyage;
  gameState.dockyardVoyagePendingTreasureRewards = rollDockyardTreasureRewards(gameState);
  return true;
}

// Pay out all stored Dockyard voyage rewards and clear the finished trip.
function collectDockyardVoyageRewards(gameState) {
  let fishReward = gameState.dockyardVoyagePendingFish || 0;

  if (fishReward > 0 && Math.random() < getDockyardFishDoubleChance(gameState)) {
    fishReward *= 2;
  }

  gameState.fish += fishReward;
  gameState.scrap += gameState.dockyardVoyagePendingScrap || 0;

  if (gameState.dockyardVoyagePendingTreasureRewards && typeof gameState.dockyardVoyagePendingTreasureRewards === "object") {
    Object.keys(gameState.dockyardVoyagePendingTreasureRewards).forEach(function (rewardId) {
      const rewardAmount = gameState.dockyardVoyagePendingTreasureRewards[rewardId];
      const rewardItem = getItemById(rewardId);

      if (rewardItem) {
        addItemCount(gameState, rewardId, rewardAmount);
        return;
      }

      if (typeof gameState[rewardId] === "number") {
        gameState[rewardId] += rewardAmount;
      }
    });
  }

  gameState.dockyardVoyagePendingFish = 0;
  gameState.dockyardVoyagePendingScrap = 0;
  gameState.dockyardVoyagePendingTreasureRewards = {};
  gameState.dockyardVoyageStart = null;
  gameState.dockyardVoyageActive = false;
  gameState.dockyardVoyageReady = false;
  clampGameStateResources(gameState);
}

// Instantly finish the current Dockyard voyage while leaving its pre-rolled
// reward bundle intact for collection.
function finishDockyardVoyageImmediately(gameState) {
  if (!gameState.dockyardVoyageActive || gameState.dockyardVoyageReady) {
    return false;
  }

  gameState.dockyardVoyageReady = true;
  return true;
}

// Summarize the pending Dockyard rewards for button tooltips and ready-state UI.
function getDockyardPendingRewardSummary(gameState) {
  const rewardParts = [];

  if (gameState.dockyardVoyagePendingFish > 0) {
    rewardParts.push(formatLargeNumber(gameState.dockyardVoyagePendingFish) + " fish");
  }

  if (gameState.dockyardVoyagePendingScrap > 0) {
    rewardParts.push(formatLargeNumber(gameState.dockyardVoyagePendingScrap) + " scrap");
  }

  if (gameState.dockyardVoyagePendingTreasureRewards && typeof gameState.dockyardVoyagePendingTreasureRewards === "object") {
    Object.keys(gameState.dockyardVoyagePendingTreasureRewards).forEach(function (rewardId) {
      const rewardAmount = gameState.dockyardVoyagePendingTreasureRewards[rewardId];
      const rewardItem = getItemById(rewardId);

      if (rewardAmount > 0) {
        if (rewardItem) {
          rewardParts.push(formatLargeNumber(rewardAmount) + " " + rewardItem.name);
          return;
        }

        if (rewardId === "coins") {
          rewardParts.push(formatCoins(rewardAmount) + " coins");
          return;
        }

        rewardParts.push(formatLargeNumber(rewardAmount) + " " + rewardId);
      }
    });
  }

  if (rewardParts.length === 0) {
    return "No rewards";
  }

  return rewardParts.join(" | ");
}

// Start a new automated Dockyard voyage when its overseer and coin minimum are
// both satisfied.
function tryAutoStartDockyard(gameState, currentTime) {
  if (
    !isDockyardUnlocked(gameState) ||
    gameState.dockyardVoyageActive ||
    gameState.dockyardVoyageReady ||
    !getAssignedOverseerId(gameState, "dockyard") ||
    gameState.dockyardCoinThreshold <= 0
  ) {
    return false;
  }

  const minimumCoinRequirement = Math.max(100000, gameState.dockyardCoinThreshold);

  if (gameState.coins < minimumCoinRequirement) {
    return false;
  }

  return startDockyardVoyage(gameState, currentTime);
}

// Let the Dockyard overseer close completed voyages and launch the next one if
// the saved coin reserve still supports automation.
function runDockyardAutomation(gameState, currentTime) {
  let didChange = false;

  if (
    !isDockyardUnlocked(gameState) ||
    !getAssignedOverseerId(gameState, "dockyard") ||
    gameState.dockyardCoinThreshold <= 0
  ) {
    return false;
  }

  if (gameState.dockyardVoyageReady) {
    collectDockyardVoyageRewards(gameState);
    didChange = true;
  }

  if (tryAutoStartDockyard(gameState, currentTime)) {
    didChange = true;
  }

  return didChange;
}

// Replay elapsed sawmill time across the whole offline span so an assigned
// overseer can finish, collect, and restart multiple batches while away.
function catchUpSawmillAutomation(gameState, targetTime) {
  let didChange = false;
  let safeguard = 0;
  let simulationTime = gameState.lastCoinUpdate;

  while (safeguard < 1000) {
    safeguard += 1;

    if (gameState.sawmillProcessingActive && !gameState.sawmillProcessingReady && gameState.sawmillProcessingStart !== null) {
      const sawmillFinishTime = gameState.sawmillProcessingStart + getSawmillProcessingDurationMs(gameState);

      if (sawmillFinishTime > targetTime) {
        break;
      }

      gameState.sawmillProcessingReady = true;
      simulationTime = sawmillFinishTime;
      didChange = true;
    }

    if (gameState.sawmillProcessingReady) {
      if (!getAssignedOverseerId(gameState, "sawmill") || gameState.sawmillTwigThreshold <= 0) {
        break;
      }

      gameState.hardwood = addPassiveResourceWithCap(
        gameState.hardwood,
        gameState.hardwoodMax,
        gameState.sawmillProcessingPendingHardwood
      );
      gameState.sawmillProcessingPendingHardwood = 0;
      gameState.sawmillProcessingStart = null;
      gameState.sawmillProcessingActive = false;
      gameState.sawmillProcessingReady = false;
      didChange = true;
      continue;
    }

    if (
      getAssignedOverseerId(gameState, "sawmill") &&
      gameState.sawmillTwigThreshold > 0 &&
      tryAutoStartSawmill(gameState, simulationTime)
    ) {
      didChange = true;
      continue;
    }

    break;
  }

  return didChange;
}

// Replay elapsed Dockyard time across the full offline span so voyage
// automation can collect and launch repeated trips while the player is away.
function catchUpDockyardAutomation(gameState, targetTime) {
  let didChange = false;
  let safeguard = 0;
  let simulationTime = gameState.lastCoinUpdate;

  while (safeguard < 1000) {
    safeguard += 1;

    if (gameState.dockyardVoyageActive && !gameState.dockyardVoyageReady && gameState.dockyardVoyageStart !== null) {
      const dockyardFinishTime = gameState.dockyardVoyageStart + gameState.dockyardVoyageDurationMs;

      if (dockyardFinishTime > targetTime) {
        break;
      }

      gameState.dockyardVoyageReady = true;
      simulationTime = dockyardFinishTime;
      didChange = true;
    }

    if (gameState.dockyardVoyageReady) {
      if (
        !isDockyardUnlocked(gameState) ||
        !getAssignedOverseerId(gameState, "dockyard") ||
        gameState.dockyardCoinThreshold <= 0
      ) {
        break;
      }

      collectDockyardVoyageRewards(gameState);
      didChange = true;
      continue;
    }

    if (
      isDockyardUnlocked(gameState) &&
      getAssignedOverseerId(gameState, "dockyard") &&
      gameState.dockyardCoinThreshold > 0 &&
      tryAutoStartDockyard(gameState, simulationTime)
    ) {
      didChange = true;
      continue;
    }

    break;
  }

  return didChange;
}

// Advance automation across a potentially long offline span instead of only
// resolving a single "ready" state at the current timestamp.
function catchUpAutomationSystems(gameState, targetTime) {
  let didChange = false;

  if (catchUpSawmillAutomation(gameState, targetTime)) {
    didChange = true;
  }

  if (catchUpDockyardAutomation(gameState, targetTime)) {
    didChange = true;
  }

  return didChange;
}

// Advance all timer-based automation systems from the shared one-second clock
// so their progress is not tied to whichever feature page happens to be open.
function runAutomationSystems(gameState, currentTime) {
  let didChange = false;

  if (updateSawmillProcessingState(gameState, currentTime)) {
    didChange = true;
  }

  if (updateDockyardVoyageState(gameState, currentTime)) {
    didChange = true;
  }

  if (runSawmillAutomation(gameState, currentTime)) {
    didChange = true;
  }

  if (runDockyardAutomation(gameState, currentTime)) {
    didChange = true;
  }

  return didChange;
}

// Ability, tooltip, and UI-display helpers
// Count how many owned birds currently carry a given ability.
function getBirdAbilityCount(gameState, abilityId) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    if (!Array.isArray(bird.abilities) || !bird.abilities.includes(abilityId)) {
      return total;
    }

  return total + bird.count;
  }, 0);
}

// Count how many owned species carry a given ability, regardless of stack size.
function getBirdAbilitySpeciesCount(gameState, abilityId) {
  return getAcquiredBirds(gameState).reduce(function (totalSpecies, bird) {
    if (!Array.isArray(bird.abilities) || !bird.abilities.includes(abilityId)) {
      return totalSpecies;
    }

    return totalSpecies + 1;
  }, 0);
}

// Return one bird progress entry by stable id.
function getBirdById(gameState, birdId) {
  return gameState.birds.find(function (bird) {
    return bird.id === birdId;
  }) || null;
}

// Return the current owned count for one species id.
function getBirdCountById(gameState, birdId) {
  const bird = getBirdById(gameState, birdId);
  return bird ? bird.count : 0;
}

// Look up one item definition from the shared catalog by stable id.
function getItemById(itemId) {
  return ITEM_LIBRARY.find(function (item) {
    return item.id === itemId;
  }) || null;
}

// Return the current owned count for one inventory item id.
function getItemCount(gameState, itemId) {
  if (!gameState.items || typeof gameState.items !== "object") {
    return 0;
  }

  return isFiniteNumber(gameState.items[itemId]) ? gameState.items[itemId] : 0;
}

// Add item count to the inventory by stable id.
function addItemCount(gameState, itemId, amountToAdd) {
  if (!gameState.items || typeof gameState.items !== "object") {
    gameState.items = createDefaultItemCounts();
  }

  gameState.items[itemId] = getItemCount(gameState, itemId) + amountToAdd;
}

// Spend inventory items if the player has enough of them.
function spendItemCount(gameState, itemId, amountToSpend) {
  if (getItemCount(gameState, itemId) < amountToSpend) {
    return false;
  }

  gameState.items[itemId] -= amountToSpend;
  return true;
}

// Return the current item catalog merged with live owned counts.
function getInventoryItems(gameState) {
  return ITEM_LIBRARY.map(function (item) {
    return {
      ...item,
      count: getItemCount(gameState, item.id)
    };
  });
}

// Award the standard item bundle for constructing a new habitat.
function grantHabitatConstructionRewards(gameState, habitatName) {
  if (typeof habitatName !== "string") {
    return;
  }

  const habitatConstructionSeedBaitTickets = applyGlobalAbilityModifiers(
    gameState,
    10,
    "modifyHabitatConstructionSeedBaitTickets",
    {
      habitatName: habitatName
    }
  );

  addItemCount(gameState, "seedbaitticket", Math.max(0, Math.round(habitatConstructionSeedBaitTickets)));
}

// Population bonuses only stay active while their flock requirement is still met.
function isMurderPartyActive(gameState) {
  return hasUpgrade(gameState, "murderParty") && getBirdCountById(gameState, "crow") >= 3;
}

// Population bonuses only stay active while their flock requirement is still met.
function isTurtleWakeActive(gameState) {
  return hasUpgrade(gameState, "turtleWake") && getBirdCountById(gameState, "mourningdove") >= 5;
}

// Return owned species that carry a specific ability.
function getAcquiredBirdsWithAbility(gameState, abilityId) {
  return getAcquiredBirds(gameState).filter(function (bird) {
    return Array.isArray(bird.abilities) && bird.abilities.includes(abilityId);
  });
}

// Return the species id assigned to oversee a given process.
function getAssignedOverseerId(gameState, processKey) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    return null;
  }

  return gameState.overseerAssignments[processKey] || null;
}

// Assign one overseer species to a given automated process.
function setAssignedOverseerId(gameState, processKey, birdId) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    gameState.overseerAssignments = {};
  }

  gameState.overseerAssignments[processKey] = birdId;
}

// Collect species ids already assigned to other automated processes.
function getAssignedOverseerIdsExcept(gameState, processKey) {
  if (!gameState.overseerAssignments || typeof gameState.overseerAssignments !== "object") {
    return [];
  }

  return Object.keys(gameState.overseerAssignments).reduce(function (assignedIds, currentProcessKey) {
    if (currentProcessKey !== processKey && gameState.overseerAssignments[currentProcessKey]) {
      assignedIds.push(gameState.overseerAssignments[currentProcessKey]);
    }

    return assignedIds;
  }, []);
}

// Cap how much passive time can be converted into resources after returning.
function getMaxOfflineDurationMs(gameState) {
  const baseDurationMs = 4 * 60 * 60 * 1000;
  const effectiveDurationMs = applyGlobalAbilityModifiers(
    gameState,
    baseDurationMs,
    "modifyMaxOfflineDurationMs"
  );
  const cappedDurationMs = Math.min(effectiveDurationMs, 24 * 60 * 60 * 1000);
  return cappedDurationMs;
}

// Format the offline cap as a readable hour value for UI display.
function getMaxOfflineDurationLabel(gameState) {
  return (getMaxOfflineDurationMs(gameState) / (60 * 60 * 1000)).toFixed(1).replace(".0", "");
}

// Return the effective trap success chance after bedding and bait-specific abilities.
function getEffectiveCatchRate(gameState, baitType) {
  let catchRate = gameState.catchRate;
  const resolvedBaitType = baitType || gameState.trapBaitType;

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade) {
    if (typeof upgrade.modifyCatchRate === "function") {
      catchRate = upgrade.modifyCatchRate(catchRate, {
        gameState: gameState,
        baitType: resolvedBaitType
      });
    }
  });

  catchRate = applyGlobalAbilityModifiers(
    gameState,
    catchRate,
    "modifyCatchRate",
    {
      baitType: resolvedBaitType
    }
  );

  return Math.min(1, Math.max(0, catchRate));
}

// Run one shared modifier hook across every acquired global ability.
function applyGlobalAbilityModifiers(gameState, startingValue, hookName, extraContext) {
  let currentValue = startingValue;

  Object.keys(ABILITIES).forEach(function (abilityId) {
    const ability = ABILITIES[abilityId];
    const totalIndividuals = getBirdAbilityCount(gameState, abilityId);
    const totalSpecies = getBirdAbilitySpeciesCount(gameState, abilityId);

    if (
      totalIndividuals <= 0 ||
      typeof ability[hookName] !== "function"
    ) {
      return;
    }

    currentValue = ability[hookName](currentValue, Object.assign({}, extraContext, {
      abilityId: abilityId,
      gameState: gameState,
      totalIndividuals: totalIndividuals,
      totalSpecies: totalSpecies
    }));
  });

  return currentValue;
}

// Apply all matching ability handlers for a trap seed bait cost calculation.
function getEffectiveTrapSeedCost(gameState) {
  const effectiveCost = applyGlobalAbilityModifiers(
    gameState,
    gameState.trapLoadCost,
    "modifyTrapSeedCost"
  );

  return Math.max(1, effectiveCost);
}

// Apply all matching ability handlers for Dockyard fish haul calculations.
function getEffectiveFishPerVoyage(gameState) {
  const effectiveFishPerVoyage = applyGlobalAbilityModifiers(
    gameState,
    gameState.dockyardFishPerVoyage,
    "modifyFishPerVoyage"
  );

  return Math.max(0, effectiveFishPerVoyage);
}

function getDockyardTreasureChance(gameState) {
  const treasureChance = applyGlobalAbilityModifiers(
    gameState,
    gameState.dockyardTreasureChance,
    "modifyVoyageTreasureChance"
  );

  return Math.max(0, Math.min(1, treasureChance));
}

function getDockyardFishDoubleChance(gameState) {
  const doubleChance = applyGlobalAbilityModifiers(
    gameState,
    0,
    "modifyVoyageFishDoubleChance"
  );

  return Math.max(0, Math.min(1, doubleChance));
}

function getGrubHuntCritChance(gameState) {
  const critChance = applyGlobalAbilityModifiers(
    gameState,
    0,
    "modifyGrubHuntCritChance"
  );

  return Math.max(0, Math.min(1, critChance));
}

function getGrubHuntCritMultiplier(gameState) {
  const critMultiplier = applyGlobalAbilityModifiers(
    gameState,
    1,
    "modifyGrubHuntCritMultiplier"
  );

  return Math.max(1, critMultiplier);
}

function getGrubHuntReward(gameState) {
  const baseReward = Math.max(0, gameState.grubsPerClick || 0);
  const didCrit = baseReward > 0 && Math.random() < getGrubHuntCritChance(gameState);

  return {
    didCrit: didCrit,
    rewardAmount: didCrit
      ? Math.round(baseReward * getGrubHuntCritMultiplier(gameState))
      : baseReward
  };
}

// Fish bait currently uses one flat price so Harbor progression can set the
// resource pace without trap-price escalation muddying it.
function getEffectiveTrapFishCost() {
  return 5;
}

function getSawmillTwigProcessingCost(gameState) {
  let processingCost = 10000;

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade) {
    if (typeof upgrade.modifySawmillTwigProcessingCost === "function") {
      processingCost = upgrade.modifySawmillTwigProcessingCost(processingCost, gameState);
    }
  });

  return Math.max(1, Math.round(processingCost));
}

function getSawmillProcessingDurationMs(gameState) {
  let processingDurationMs = gameState.sawmillProcessingDurationMs;

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade) {
    if (typeof upgrade.modifySawmillProcessingDurationMs === "function") {
      processingDurationMs = upgrade.modifySawmillProcessingDurationMs(processingDurationMs, gameState);
    }
  });

  return Math.max(1000, Math.round(processingDurationMs));
}

// Grow the base seed-bait load cost after a successful catch. The early climb
// is steeper, then softens once the base price reaches 10k seeds.
function getNextTrapSeedLoadCost(currentCost) {
  const safeCurrentCost = isFiniteNumber(currentCost)
    ? currentCost
    : GAME_STATE_DEFAULTS.trapLoadCost;
  const growthRate = safeCurrentCost >= 10000 ? 1.075 : 1.15;

  return safeCurrentCost * growthRate;
}

// Turn a bird's ability ids into readable ability names for UI display.
function getBirdAbilityNames(bird) {
  if (!Array.isArray(bird.abilities) || bird.abilities.length === 0) {
    return [];
  }

  return bird.abilities.map(function (abilityId) {
    if (ABILITIES[abilityId] && ABILITIES[abilityId].name) {
      return ABILITIES[abilityId].name;
    }

    return abilityId;
  });
}

// Turn a bird's ability ids into readable descriptions for tooltip display.
function getBirdAbilityDescriptions(bird) {
  if (!Array.isArray(bird.abilities) || bird.abilities.length === 0) {
    return [];
  }

  return bird.abilities.map(function (abilityId) {
    if (ABILITIES[abilityId] && ABILITIES[abilityId].description) {
      return ABILITIES[abilityId].description;
    }

    return abilityId;
  });
}

// Map a rarity name to the shared CSS class used by UI pages.
function getRarityClassName(rarityName) {
  if (typeof rarityName !== "string") {
    return "";
  }

  return "rarity-" + rarityName.toLowerCase();
}

// Sort habitat birds by rarity tier first, then species name alphabetically.
function compareBirdsByRarityThenSpecies(leftBird, rightBird) {
  const leftRarityIndex = RARITY_ORDER.indexOf(leftBird.rarity);
  const rightRarityIndex = RARITY_ORDER.indexOf(rightBird.rarity);
  const normalizedLeftRarityIndex = leftRarityIndex === -1 ? Number.MAX_SAFE_INTEGER : leftRarityIndex;
  const normalizedRightRarityIndex = rightRarityIndex === -1 ? Number.MAX_SAFE_INTEGER : rightRarityIndex;

  if (normalizedLeftRarityIndex !== normalizedRightRarityIndex) {
    return normalizedLeftRarityIndex - normalizedRightRarityIndex;
  }

  return leftBird.species.localeCompare(rightBird.species);
}

// Format per-second style resource values without noisy trailing zeroes.
function formatRateValue(value) {
  const roundedValue = Number(value.toFixed(2));

  if (Number.isInteger(roundedValue)) {
    return roundedValue.toString();
  }

  return roundedValue.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

// Collect the resource rows a bird should show in the UI.
function getBirdResourceEntries(bird, gameState, options) {
  const displayOptions = options || {};

  return BIRD_RESOURCE_DEFINITIONS.reduce(function (entries, definition) {
    let value = displayOptions.baseValues
      ? bird[definition.key]
      : definition.getValue(bird, gameState);

    const shouldDisplayStat = displayOptions.baseValues
      ? typeof bird[definition.key] === "number"
      : (typeof value === "number" && value > 0);

    if (!shouldDisplayStat) {
      return entries;
    }

    if (displayOptions.multiplyByCount) {
      value *= (bird.count || 0);
    }

    entries.push({
      label: definition.label,
      value: value
    });

    return entries;
  }, []);
}

// Convert shared bird resource rows into reusable HTML snippets.
function getBirdResourceLinesHtml(bird, gameState, options) {
  const displayOptions = options || {};
  const lineTag = displayOptions.lineTag || "p";
  const lineClassName = displayOptions.lineClassName ? " class='" + displayOptions.lineClassName + "'" : "";

  return getBirdResourceEntries(bird, gameState, displayOptions).map(function (entry) {
    return "<" + lineTag + lineClassName + ">" + entry.label + ": +" + formatRateValue(entry.value) + "</" + lineTag + ">";
  }).join("");
}

// Bird rendering and catch-resolution helpers
// Repair older bird-save fields and report whether anything changed.
function repairLegacyBirdProgress(gameState) {
  let didChange = false;

  gameState.birds.forEach(function (bird) {
    const originalCount = typeof bird.count === "number" ? bird.count : null;
    const originalAcquired = bird.acquired === true;

    if (typeof bird.count !== "number") {
      bird.count = bird.acquired ? 1 : 0;
      didChange = true;
    }

    if (bird.count > 0 && bird.acquired !== true) {
      bird.acquired = true;
      didChange = true;
    }

    if (bird.count <= 0 && bird.acquired === true) {
      bird.count = 1;
      didChange = true;
    }

    if (bird.variantImages) {
      if (!bird.variantCounts || typeof bird.variantCounts !== "object") {
        bird.variantCounts = createBirdVariantCounts(bird, bird.count);
        didChange = true;
      } else {
        let assignedVariantCount = 0;

        Object.keys(bird.variantImages).forEach(function (variantKey) {
          if (typeof bird.variantCounts[variantKey] !== "number") {
            bird.variantCounts[variantKey] = 0;
            didChange = true;
          }

          assignedVariantCount += bird.variantCounts[variantKey];
        });

        if (assignedVariantCount !== bird.count) {
          bird.variantCounts = mergeBirdVariantCounts(bird, bird, bird.count);
          didChange = true;
        }
      }
    }

    if (originalCount !== bird.count || originalAcquired !== bird.acquired) {
      didChange = true;
    }
  });

  return {
    didChange: didChange,
    totalIndividuals: getTotalBirdCount(gameState),
    commonIndividuals: getCaughtBirdCountByRarity(gameState, "Common")
  };
}

// Return which visual variants of a bird are currently owned.
function getOwnedBirdVariantKeys(bird) {
  if (!bird.variantImages) {
    return [];
  }

  return Object.keys(bird.variantImages).filter(function (variantKey) {
    return (bird.variantCounts && bird.variantCounts[variantKey] > 0);
  });
}

// Build the image list a habitat panel should show for this species.
function getBirdHabitatImages(bird) {
  if (!bird.variantImages) {
    return [{
      src: bird.image,
      alt: bird.species + " inside the aviary habitat"
    }];
  }

  const visibleVariantKeys = getOwnedBirdVariantKeys(bird);
  const variantKeysToShow = visibleVariantKeys.length > 0
    ? visibleVariantKeys
    : [Object.keys(bird.variantImages)[0]];

  return variantKeysToShow.map(function (variantKey) {
    return {
      variantKey: variantKey,
      src: bird.variantImages[variantKey],
      alt: bird.species + " (" + variantKey + ") inside the aviary habitat"
    };
  });
}

// Pick one representative image for overlays or single-image contexts.
function getBirdPrimaryImage(bird) {
  if (bird.image) {
    return bird.image;
  }

  if (bird.variantImages) {
    const firstVariantKey = Object.keys(bird.variantImages)[0];
    return bird.variantImages[firstVariantKey];
  }

  return "";
}

// Assign one caught individual into a random owned visual variant bucket.
function addBirdToFlock(bird) {
  bird.acquired = true;
  bird.count += 1;

  if (!bird.variantImages) {
    return null;
  }

  const variantKeys = Object.keys(bird.variantImages);

  if (!bird.variantCounts || typeof bird.variantCounts !== "object") {
    bird.variantCounts = createBirdVariantCounts(bird, 0);
  }

  const chosenVariantKey = variantKeys[Math.floor(Math.random() * variantKeys.length)];
  bird.variantCounts[chosenVariantKey] = (bird.variantCounts[chosenVariantKey] || 0) + 1;
  return chosenVariantKey;
}

// Remove owned individuals from one species and keep variant counts in sync.
function removeBirdsFromFlock(gameState, birdId, amountToRemove) {
  const bird = getBirdById(gameState, birdId);

  if (!bird || amountToRemove <= 0 || bird.count < amountToRemove) {
    return false;
  }

  bird.count -= amountToRemove;

  if (bird.variantCounts && typeof bird.variantCounts === "object") {
    let remainingToRemove = amountToRemove;

    while (remainingToRemove > 0) {
      const removableVariantKeys = Object.keys(bird.variantCounts).filter(function (variantKey) {
        return (bird.variantCounts[variantKey] || 0) > 0;
      });

      if (removableVariantKeys.length === 0) {
        break;
      }

      const selectedVariantKey = removableVariantKeys[Math.floor(Math.random() * removableVariantKeys.length)];
      bird.variantCounts[selectedVariantKey] = Math.max(0, (bird.variantCounts[selectedVariantKey] || 0) - 1);
      remainingToRemove -= 1;
    }
  }

  bird.acquired = bird.count > 0;
  return true;
}

// Start from base rarity odds and apply bedding modifiers.
function getBaseRarityWeights(gameState) {
  let rarityWeights = { ...RARITY_WEIGHTS };

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade){
    if (typeof upgrade.modifyRarityWeights === "function"){
      rarityWeights = upgrade.modifyRarityWeights(rarityWeights, gameState);
    }
  });
  return rarityWeights;
}

// Redistribute rarity odds when a habitat pool is missing some tiers.
function getEffectiveRarityWeightsForGameState(birdPool, gameState) {
  const effectiveWeights = {
    Common: 0,
    Uncommon: 0,
    Rare: 0,
    Epic: 0,
    Legendary: 0
  };

  const presentRarities = new Set(
    birdPool.map(function (bird) {
      return bird.rarity;
    })
  );

  RARITY_ORDER.forEach(function (rarity, rarityIndex) {
    const baseWeight = getBaseRarityWeights(gameState)[rarity];

    if (presentRarities.has(rarity)) {
      effectiveWeights[rarity] += baseWeight;
      return;
    }

    for (let i = rarityIndex - 1; i >= 0; i -= 1) {
      if (presentRarities.has(RARITY_ORDER[i])) {
        effectiveWeights[RARITY_ORDER[i]] += baseWeight;
        return;
      }
    }

    for (let i = rarityIndex + 1; i < RARITY_ORDER.length; i += 1) {
      if (presentRarities.has(RARITY_ORDER[i])) {
        effectiveWeights[RARITY_ORDER[i]] += baseWeight;
        return;
      }
    }
  });

  return effectiveWeights;
}

// Pick one random bird after rarity weighting has been resolved.
function getRandomBirdByRarityForGameState(birdPool, gameState) {
  if (birdPool.length === 0) {
    return null;
  }

  const effectiveWeights = getEffectiveRarityWeightsForGameState(birdPool, gameState);
  const roll = Math.random() * 100;
  let cumulativeWeight = 0;
  let selectedRarity = null;

  RARITY_ORDER.forEach(function (rarity) {
    if (selectedRarity !== null) {
      return;
    }

    cumulativeWeight += effectiveWeights[rarity];
    if (roll < cumulativeWeight) {
      selectedRarity = rarity;
    }
  });

  if (selectedRarity === null) {
    selectedRarity = RARITY_ORDER.find(function (rarity) {
      return effectiveWeights[rarity] > 0;
    });
  }

  const birdsInRarity = birdPool.filter(function (bird) {
    return bird.rarity === selectedRarity;
  });

  return birdsInRarity[Math.floor(Math.random() * birdsInRarity.length)];
}

// Resource-rate and formatting helpers
// Convert visitors/day into passive coin income.
function getCoinsPerSecond(gameState) {
  return getVisitorsPerDay(gameState) * getCoinsPerVisitorRate(gameState);
}

// Return how many coins each visitor/day point is worth per second.
function getCoinsPerVisitorRate(gameState) {
  let coinsPerVisitorRate = applyGlobalAbilityModifiers(
    gameState,
    0.1,
    "modifyCoinsPerVisitorRate"
  );

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade) {
    if (typeof upgrade.modifyCoinsPerVisitorRate === "function") {
      coinsPerVisitorRate = upgrade.modifyCoinsPerVisitorRate(coinsPerVisitorRate, {
        gameState: gameState
      });
    }
  });

  return coinsPerVisitorRate;
}

// Sum seed production coming specifically from trees.
function getTreeSeedsPerSecond(gameState) {
  return (
    gameState.appleTrees * 0.5 +
    gameState.pearTrees * 1.5 +
    gameState.peachTrees * 3 +
    gameState.orangeTrees * 5
  );
}

// Sum seed production coming specifically from birds.
function getBirdSeedsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdSeedRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum twig production coming specifically from birds before other systems modify it.
function getBirdTwigsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdTwigRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum grub production coming specifically from birds before other systems modify it.
function getBirdGrubsPerSecond(gameState) {
  return getAcquiredBirds(gameState).reduce(function (total, bird) {
    return total + (getBirdGrubRatePerSecond(bird, gameState) * bird.count);
  }, 0);
}

// Sum all seed production from both trees and birds.
function getSeedsPerSecond(gameState) {
  return getTreeSeedsPerSecond(gameState) + getBirdSeedsPerSecond(gameState) - getGrubFarmRates(gameState).seedsPerSecond;
}

// Sum all twig production from birds with twig-generating traits.
function getTwigsPerSecond(gameState) {
  return getBirdTwigsPerSecond(gameState) - getGrubFarmRates(gameState).twigsPerSecond;
}

// Sum all grub production from birds with grub-generating traits.
function getGrubsPerSecond(gameState) {
  return getBirdGrubsPerSecond(gameState) + getGrubFarmRates(gameState).grubsPerSecond;
}

// Sum the total tree-cap bonus birds currently grant for one orchard type.
function getBirdTreeBonusTotal(gameState, treeBonusKey) {
  return getAcquiredBirds(gameState).reduce(function (totalBonus, bird) {
    return totalBonus + (getBirdTreeBonusValue(bird, gameState, treeBonusKey) * bird.count);
  }, 0);
}

// Tree caps start low and expand through sapling and flock upgrades.
function getTreeMaxCount(gameState, treeKey) {
  let maxCount = 1;
  const treeBonusKey = TREE_BONUS_KEY_BY_TREE_KEY[treeKey];

  if (treeBonusKey) {
    maxCount += getBirdTreeBonusTotal(gameState, treeBonusKey);
  }

  getOwnedUpgradeDefinitions(gameState).forEach(function (upgrade) {
    if (typeof upgrade.modifyTreeMaxCount === "function") {
      maxCount = upgrade.modifyTreeMaxCount(maxCount, {
        gameState: gameState,
        treeKey: treeKey
      });
    }
  });

  return maxCount;
}

// Format coins for UI display.
function formatCoins(coins) {
  return formatLargeNumber(coins);
}

// Format seeds for UI display.
function formatSeeds(seeds) {
  return formatLargeNumber(seeds);
}

// Keep capped resources inside their valid ranges after any update.
function clampGameStateResources(gameState) {
  gameState.coins = Math.max(0, gameState.coins);
  gameState.seeds = Math.max(0, gameState.seeds);
  gameState.grubs = Math.max(0, gameState.grubs);
  gameState.twigs = Math.max(0, gameState.twigs);
  gameState.hardwood = Math.max(0, gameState.hardwood);
  gameState.mice = Math.max(0, gameState.mice);
}

// Abbreviate large numbers with k and M for cleaner UI labels.
function formatLargeNumber(value) {
  const wholeValue = Math.floor(value);

  if (wholeValue >= 1000000) {
    return (wholeValue / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (wholeValue >= 10000) {
    const thousandsValue = Number((wholeValue / 1000).toFixed(1));

    if (thousandsValue >= 1000) {
      return "1M";
    }

    return thousandsValue.toString().replace(".0", "") + "k";
  }

  return wholeValue.toString();
}

// Shared top-bar renderer and interaction helpers
// Render or refresh the shared top bar used across pages.
function renderTopBar(topBarElement, gameState) {
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const treeSeedsPerSecond = getTreeSeedsPerSecond(gameState);
  const birdSeedsPerSecond = getBirdSeedsPerSecond(gameState);
  const birdGrubsPerSecond = getBirdGrubsPerSecond(gameState);
  const birdTwigsPerSecond = getBirdTwigsPerSecond(gameState);
  const grubFarmRates = getGrubFarmRates(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const grubsPerSecond = getGrubsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);

  if (!topBarElement.querySelector(".top-bar-content")) {
    // Build the shared shell once so later refreshes only update text values
    // instead of replacing the whole top bar and disturbing open tooltips.
    topBarElement.innerHTML =
      "<div class='top-bar-content'>" +
        "<div class='top-bar-stats'>" +
          "<span class='top-bar-tooltip'>" +
            "<span class='top-bar-seeds'></span>" +
            "<span class='top-bar-tooltip-box top-bar-seeds-tooltip'></span>" +
            "</span>" +
            "<span class='top-bar-grubs-wrapper' style='display: none;'> | <span class='top-bar-tooltip'><span class='top-bar-grubs'></span><span class='top-bar-tooltip-box top-bar-grubs-tooltip'></span></span></span>" +
            "<span class='top-bar-hardwood-wrapper' style='display: none;'> | <span class='top-bar-hardwood'></span></span>" +
            "<span class='top-bar-mice-wrapper' style='display: none;'> | <span class='top-bar-mice'></span></span>" +
            "<span class='top-bar-fish-wrapper' style='display: none;'> | <span class='top-bar-fish'></span></span>" +
            "<span class='top-bar-scrap-wrapper' style='display: none;'> | <span class='top-bar-scrap'></span></span>" +
            " | <span class='top-bar-tooltip'>" +
              "<span class='top-bar-coins'></span>" +
              "<span class='top-bar-tooltip-box top-bar-coins-tooltip'></span>" +
            "</span>" +
            "<span class='top-bar-twigs-wrapper' style='display: none;'> | <span class='top-bar-tooltip'>" +
              "<span class='top-bar-twigs'></span>" +
              "<span class='top-bar-tooltip-box top-bar-twigs-tooltip'></span>" +
            "</span></span>" +
          "</div>" +
        "<div class='top-bar-nav'>" +
          "<a class='top-bar-link' href='inventory.html'>Inventory</a> | " +
          "<a class='top-bar-link' href='compendium.html'>Compendium</a> | " +
          "<a class='top-bar-link' href='settings.html'>Settings</a>" +
        "</div>" +
      "</div>";
  }

  const seedsElement = topBarElement.querySelector(".top-bar-seeds");
  const grubsElement = topBarElement.querySelector(".top-bar-grubs");
  const hardwoodElement = topBarElement.querySelector(".top-bar-hardwood");
  const miceElement = topBarElement.querySelector(".top-bar-mice");
  const fishElement = topBarElement.querySelector(".top-bar-fish");
  const scrapElement = topBarElement.querySelector(".top-bar-scrap");
  const coinsElement = topBarElement.querySelector(".top-bar-coins");
  const twigsElement = topBarElement.querySelector(".top-bar-twigs");
  const seedsTooltipElement = topBarElement.querySelector(".top-bar-seeds-tooltip");
  const grubsTooltipElement = topBarElement.querySelector(".top-bar-grubs-tooltip");
  const coinsTooltipElement = topBarElement.querySelector(".top-bar-coins-tooltip");
  const twigsTooltipElement = topBarElement.querySelector(".top-bar-twigs-tooltip");
  const twigsWrapperElement = topBarElement.querySelector(".top-bar-twigs-wrapper");
  const grubsWrapperElement = topBarElement.querySelector(".top-bar-grubs-wrapper");
  const hardwoodWrapperElement = topBarElement.querySelector(".top-bar-hardwood-wrapper");
  const miceWrapperElement = topBarElement.querySelector(".top-bar-mice-wrapper");
  const fishWrapperElement = topBarElement.querySelector(".top-bar-fish-wrapper");
  const scrapWrapperElement = topBarElement.querySelector(".top-bar-scrap-wrapper");

  // Update the visible stat text first so every page stays in sync with the
  // shared resource math coming from game.js.
  seedsElement.textContent = "Seeds: " + formatSeeds(gameState.seeds);
  grubsElement.textContent = "Grubs: " + formatLargeNumber(gameState.grubs);
  hardwoodElement.textContent = "Hardwood: " + formatLargeNumber(gameState.hardwood);
  miceElement.textContent = "Mice: " + formatLargeNumber(gameState.mice);
  fishElement.textContent = "Fish: " + formatLargeNumber(gameState.fish);
  scrapElement.textContent = "Scrap: " + formatLargeNumber(gameState.scrap);
  coinsElement.textContent = "Coins: " + formatCoins(gameState.coins);
  twigsElement.textContent = "Twigs: " + formatLargeNumber(gameState.twigs);

  // The seed and grub tooltips use multiline breakdowns because those
  // resources now come from multiple systems with positive and negative flows.
  seedsTooltipElement.style.left = "0";
  seedsTooltipElement.style.transform = "none";
  seedsTooltipElement.style.whiteSpace = "normal";
  seedsTooltipElement.style.minWidth = "220px";
  seedsTooltipElement.style.textAlign = "left";
  seedsTooltipElement.innerHTML =
    "Seeds from trees: " + treeSeedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Seeds from birds: " + birdSeedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Seeds from grub farm: -" + grubFarmRates.seedsPerSecond.toFixed(1) + " seeds/sec<br>" +
    "Total: " + seedsPerSecond.toFixed(1) + " seeds/sec | Max seeds: " + formatSeeds(gameState.seedMax);

  grubsTooltipElement.style.left = "0";
  grubsTooltipElement.style.transform = "none";
  grubsTooltipElement.style.whiteSpace = "normal";
  grubsTooltipElement.style.minWidth = "220px";
  grubsTooltipElement.style.textAlign = "left";
  grubsTooltipElement.innerHTML =
    "Grubs from birds: " + birdGrubsPerSecond.toFixed(2) + " grubs/sec<br>" +
    "Grubs from grub farm: " + grubFarmRates.grubsPerSecond.toFixed(2) + " grubs/sec<br>" +
    "Total: " + grubsPerSecond.toFixed(2) + " grubs/sec | Max grubs: " + formatLargeNumber(gameState.grubMax);

  coinsTooltipElement.textContent =
    "Coins from visitors: " + coinsPerSecond.toFixed(1) + " coins/sec | Max coins: " + formatCoins(gameState.coinMax);

  twigsTooltipElement.textContent =
    "Twigs from birds: " + birdTwigsPerSecond.toFixed(2) +
    " twigs/sec | Twigs from grub farm: -" + grubFarmRates.twigsPerSecond.toFixed(2) +
    " twigs/sec | Total: " + twigsPerSecond.toFixed(2) + " twigs/sec | Max twigs: " + formatLargeNumber(gameState.twigMax);

  // Hide resources the player has not reached yet so the top bar stays compact
  // early, then reveal them as soon as they matter.
  twigsWrapperElement.style.display =
    (gameState.twigs >= 1 || twigsPerSecond > 0) ? "inline" : "none";
  grubsWrapperElement.style.display =
    (gameState.grubs >= 1 || grubsPerSecond > 0) ? "inline" : "none";
  hardwoodWrapperElement.style.display =
    gameState.hardwood >= 1 ? "inline" : "none";
  miceWrapperElement.style.display =
    gameState.mice >= 1 ? "inline" : "none";
  fishWrapperElement.style.display =
    gameState.fish >= 1 ? "inline" : "none";
  scrapWrapperElement.style.display =
    gameState.scrap >= 1 ? "inline" : "none";
}

let sharedButtonSound = null;
let tooltipViewportAdjustmentInitialized = false;

// Ask supporting mobile browsers to treat game SFX as ambient audio so they
// can mix with a user's music instead of taking over the device audio session.
function configureAmbientGameAudioSession() {
  if (
    typeof navigator === "undefined" ||
    !navigator.audioSession ||
    !("type" in navigator.audioSession)
  ) {
    return;
  }

  try {
    navigator.audioSession.type = "ambient";
  } catch (error) {}
}

// Play one short game sound effect through the shared ambient-audio setup when
// the browser supports it.
function playGameSound(audioElement) {
  if (!audioElement) {
    return;
  }

  configureAmbientGameAudioSession();

  const playPromise = audioElement.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(function () {});
  }
}

// Play the shared UI click sound on demand after an action succeeds.
function playButtonSound() {
  if (sharedButtonSound === null) {
    sharedButtonSound = new Audio("/Resources/Sound%20Effects/button.mp3");
  }

  sharedButtonSound.currentTime = 0;
  playGameSound(sharedButtonSound);
}

// Handle automatic sound for navigation and simple ungated controls.
function initButtonAudio() {
  configureAmbientGameAudioSession();

  document.addEventListener("click", function (event) {
    const linkControl = event.target.closest("a.button, a.back-link, a.menu-button, a.top-bar-link");

    if (linkControl && !linkControl.classList.contains("is-locked")) {
      const href = linkControl.getAttribute("href");

      if (
        href &&
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        playButtonSound();
        setTimeout(function () {
          window.location.href = href;
        }, 120);
      }
      return;
    }

    const buttonControl = event.target.closest("button, .overview-button, .action-button, .danger-button");

    if (
      !buttonControl ||
      buttonControl.classList.contains("log-button") ||
      buttonControl.dataset.requiresSuccess === "true"
    ) {
      return;
    }

    playButtonSound();
  });
}

// Keep visible tooltips inside the viewport even when their content grows over time.
function adjustTooltipIntoViewport(tooltipBox) {
  if (!tooltipBox) {
    return;
  }

  if (!tooltipBox.dataset.originalInlineLeft) {
    tooltipBox.dataset.originalInlineLeft = tooltipBox.style.left || "";
    tooltipBox.dataset.originalInlineRight = tooltipBox.style.right || "";
    tooltipBox.dataset.originalInlineTransform = tooltipBox.style.transform || "";
    tooltipBox.dataset.originalInlineMaxWidth = tooltipBox.style.maxWidth || "";
    tooltipBox.dataset.originalInlineWhiteSpace = tooltipBox.style.whiteSpace || "";
  }

  tooltipBox.style.left = tooltipBox.dataset.originalInlineLeft;
  tooltipBox.style.right = tooltipBox.dataset.originalInlineRight;
  tooltipBox.style.transform = tooltipBox.dataset.originalInlineTransform;
  tooltipBox.style.maxWidth = tooltipBox.dataset.originalInlineMaxWidth;
  tooltipBox.style.whiteSpace = tooltipBox.dataset.originalInlineWhiteSpace;

  const viewportPadding = 8;
  const maxTooltipWidth = Math.max(180, window.innerWidth - (viewportPadding * 2));
  tooltipBox.style.maxWidth = maxTooltipWidth + "px";

  const tooltipRect = tooltipBox.getBoundingClientRect();

  if (tooltipRect.width > maxTooltipWidth) {
    tooltipBox.style.whiteSpace = "normal";
  }

  if (tooltipRect.right > window.innerWidth - viewportPadding) {
    tooltipBox.style.left = "auto";
    tooltipBox.style.right = "0";
    tooltipBox.style.transform = "none";
  }

  if (tooltipBox.getBoundingClientRect().left < viewportPadding) {
    tooltipBox.style.left = "0";
    tooltipBox.style.right = "auto";
    tooltipBox.style.transform = "none";
  }
}

// Watch tooltip hosts and nudge their boxes back on screen when they open.
function initViewportAwareTooltips() {
  if (tooltipViewportAdjustmentInitialized) {
    return;
  }

  tooltipViewportAdjustmentInitialized = true;

  function queueTooltipAdjustFromEvent(event) {
    const tooltipHost = event.target.closest(
      ".top-bar-tooltip, .upgrade-tooltip, .nav-tooltip, .panel-tab-tooltip, .process-tooltip, .compendium-tooltip, .bird-ability-shell"
    );

    if (!tooltipHost) {
      return;
    }

    const tooltipBox = tooltipHost.querySelector("[class*='tooltip-box']");

    if (!tooltipBox) {
      return;
    }

    setTimeout(function () {
      adjustTooltipIntoViewport(tooltipBox);
    }, 0);
  }

  document.addEventListener("mouseover", queueTooltipAdjustFromEvent);
  document.addEventListener("focusin", queueTooltipAdjustFromEvent);
  document.addEventListener("click", queueTooltipAdjustFromEvent);
  window.addEventListener("resize", function () {
    document.querySelectorAll("[class*='tooltip-box']").forEach(function (tooltipBox) {
      adjustTooltipIntoViewport(tooltipBox);
    });
  });
}

// Passive income loop and offline-progress helpers
// Apply passive resource income based on real elapsed time.
function updateCoinsFromElapsedTime(gameState, currentTime) {
  const didAutomationUpdate = runAutomationSystems(gameState, currentTime);
  const coinsPerSecond = getCoinsPerSecond(gameState);
  const passiveTreeSeedsPerSecond = getTreeSeedsPerSecond(gameState);
  const passiveBirdSeedsPerSecond = getBirdSeedsPerSecond(gameState);
  const passiveSeedsPerSecond = passiveTreeSeedsPerSecond + passiveBirdSeedsPerSecond;
  const passiveGrubsPerSecond = getBirdGrubsPerSecond(gameState);
  const passiveTwigsPerSecond = getBirdTwigsPerSecond(gameState);
  const grubFarmRates = getGrubFarmRates(gameState);
  const seedsPerSecond = getSeedsPerSecond(gameState);
  const grubsPerSecond = getGrubsPerSecond(gameState);
  const twigsPerSecond = getTwigsPerSecond(gameState);
  const rawElapsedTime = currentTime - gameState.lastCoinUpdate;
  const elapsedTime = Math.min(rawElapsedTime, getMaxOfflineDurationMs(gameState));
  const automationTargetTime = gameState.lastCoinUpdate + Math.max(0, elapsedTime);

  if (elapsedTime <= 0) {
    if (didAutomationUpdate) {
      clampGameStateResources(gameState);
      saveGameState(gameState);
    }

    return didAutomationUpdate;
  }

  // Even when nothing is producing right now, advance the clock so the next
  // real income change starts from "now" instead of replaying this dead span.
  if (coinsPerSecond <= 0 && seedsPerSecond <= 0 && grubsPerSecond <= 0 && twigsPerSecond <= 0) {
    catchUpAutomationSystems(gameState, automationTargetTime);
    gameState.lastCoinUpdate = currentTime;
    clampGameStateResources(gameState);
    saveGameState(gameState);
    return true;
  }

  const coinsPerMillisecond = coinsPerSecond / 1000;
  const earnedCoins = elapsedTime * coinsPerMillisecond;
  let earnedSeeds = 0;
  let earnedGrubs = 0;
  let earnedTwigs = 0;

  if (!gameState.grubFarmActive) {
    // Normal passive flow is straightforward when the grub farm is off.
    earnedSeeds = elapsedTime * (seedsPerSecond / 1000);
    earnedGrubs = elapsedTime * (grubsPerSecond / 1000);
    earnedTwigs = elapsedTime * (twigsPerSecond / 1000);
  } else {
    // The grub farm is different because it converts seeds and twigs into
    // grubs, so we need to figure out how long it can actually stay online
    // before one of its input resources runs dry.
    const elapsedSeconds = elapsedTime / 1000;
    let operableSeconds = elapsedSeconds;

    if (passiveSeedsPerSecond < grubFarmRates.seedsPerSecond) {
      operableSeconds = Math.min(
        operableSeconds,
        gameState.seeds / (grubFarmRates.seedsPerSecond - passiveSeedsPerSecond)
      );
    }

    if (passiveTwigsPerSecond < grubFarmRates.twigsPerSecond) {
      operableSeconds = Math.min(
        operableSeconds,
        gameState.twigs / (grubFarmRates.twigsPerSecond - passiveTwigsPerSecond)
      );
    }

    operableSeconds = Math.max(0, operableSeconds);

    const inactiveSeconds = Math.max(0, elapsedSeconds - operableSeconds);

    // Earn one set of rates while the farm is supplied, then fall back to the
    // passive bird/tree-only rates for the remainder of the elapsed time.
    earnedSeeds =
      ((passiveSeedsPerSecond - grubFarmRates.seedsPerSecond) * operableSeconds) +
      (passiveSeedsPerSecond * inactiveSeconds);
    earnedTwigs =
      ((passiveTwigsPerSecond - grubFarmRates.twigsPerSecond) * operableSeconds) +
      (passiveTwigsPerSecond * inactiveSeconds);
    earnedGrubs =
      ((passiveGrubsPerSecond + grubFarmRates.grubsPerSecond) * operableSeconds) +
      (passiveGrubsPerSecond * inactiveSeconds);

    if (operableSeconds < elapsedSeconds) {
      gameState.grubFarmActive = false;
    }
  }

  // Apply the final totals. Passive generation respects storage caps, but
  // direct rewards like treasure, quests, and codes can overflow them.
  gameState.coins = addPassiveResourceWithCap(gameState.coins, gameState.coinMax, earnedCoins);
  gameState.seeds = addPassiveResourceWithCap(gameState.seeds, gameState.seedMax, earnedSeeds);
  gameState.grubs = addPassiveResourceWithCap(gameState.grubs, gameState.grubMax, earnedGrubs);
  gameState.twigs = addPassiveResourceWithCap(gameState.twigs, gameState.twigMax, earnedTwigs);
  catchUpAutomationSystems(gameState, automationTargetTime);
  gameState.lastCoinUpdate = currentTime;
  saveGameState(gameState);
  return true;
}

// Start the recurring income loop and resync on tab return.
function startIncomeSystem(gameState, onUpdate) {
  function applyIncomeUpdate() {
    const didUpdate = updateCoinsFromElapsedTime(gameState, Date.now());

    if (didUpdate && typeof onUpdate === "function") {
      onUpdate();
    }
  }

  applyIncomeUpdate();

  // The income tick is intentionally fixed at one second, so keep the interval
  // setup explicit instead of routing through a fake variable-tick helper.
  let incomeInterval = setInterval(applyIncomeUpdate, BASE_TICK_MS);

  function restartIncomeInterval() {
    clearInterval(incomeInterval);
    incomeInterval = setInterval(applyIncomeUpdate, BASE_TICK_MS);
  }

  // Re-sync immediately when the tab becomes visible again so offline progress
  // is granted right away and the one-second loop restarts from a fresh tick.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      applyIncomeUpdate();
      restartIncomeInterval();
    }
  });

  // Focus events cover alt-tabbing back into the window even if visibility
  // listeners were not enough on their own.
  window.addEventListener("focus", function () {
    applyIncomeUpdate();
    restartIncomeInterval();
  });

  return {
    refresh: function () {
      applyIncomeUpdate();
      restartIncomeInterval();
    }
  };
}
