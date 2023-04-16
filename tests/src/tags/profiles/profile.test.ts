import test from "tape-promise/tape.js";

import { runScenario, pause, CallableCell } from "@holochain/tryorama";
import {
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
} from "@holochain/client";
import { decode } from "@msgpack/msgpack";

async function sampleProfile(cell: CallableCell, partialProfile = {}) {
  return {
    ...{
      user_name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      owner: cell.cell_id[1],
    },
    ...partialProfile,
  };
}

export async function createProfile(
  cell: CallableCell,
  profile = undefined
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "create_profile",
    payload: profile || (await sampleProfile(cell)),
  });
}

test("create Profile", async (t) => {
  await runScenario(async (scenario) => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/atlas.happ";

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Profile
    const record: Record = await createProfile(alice.cells[0]);
    t.ok(record);
  });
});

test("create and read Profile", async (t) => {
  await runScenario(async (scenario) => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/atlas.happ";

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    const sample = await sampleProfile(alice.cells[0]);

    // Alice creates a Profile
    const record: Record = await createProfile(alice.cells[0], sample);
    t.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created Profile
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "get_profile",
      payload: record.signed_action.hashed.hash,
    });
    t.deepEqual(
      sample,
      decode((createReadOutput.entry as any).Present.entry) as any
    );
  });
});

test("create and update Profile", async (t) => {
  await runScenario(async (scenario) => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/atlas.happ";

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Profile
    const record: Record = await createProfile(alice.cells[0]);
    t.ok(record);

    const originalActionHash = record.signed_action.hashed.hash;

    // Alice updates the Profile
    let contentUpdate: any = await sampleProfile(alice.cells[0]);
    let updateInput = {
      original_profile_hash: originalActionHash,
      previous_profile_hash: originalActionHash,
      updated_profile: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "update_profile",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the updated Profile
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "get_profile",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(
      contentUpdate,
      decode((readUpdatedOutput0.entry as any).Present.entry) as any
    );

    // Alice updates the Profile again
    contentUpdate = await sampleProfile(alice.cells[0]);
    updateInput = {
      original_profile_hash: originalActionHash,
      previous_profile_hash: updatedRecord.signed_action.hashed.hash,
      updated_profile: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "update_profile",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the updated Profile
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "get_profile",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(
      contentUpdate,
      decode((readUpdatedOutput1.entry as any).Present.entry) as any
    );
  });
});

test("create and delete Profile", async (t) => {
  await runScenario(async (scenario) => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/atlas.happ";

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a Profile
    const record: Record = await createProfile(alice.cells[0]);
    t.ok(record);

    // Alice deletes the Profile
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "delete_profile",
      payload: record.signed_action.hashed.hash,
    });
    t.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);

    // Bob tries to get the deleted Profile
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "get_profile",
      payload: record.signed_action.hashed.hash,
    });
    t.notOk(readDeletedOutput);
  });
});
