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

async function sampleCommunity(cell: CallableCell, partialCommunity = {}) {
  return {
    ...{
      name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      location: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      members: cell.cell_id[1],
      owner: cell.cell_id[1],
      created_at: 1674053334548000,
      public_community: true,
    },
    ...partialCommunity,
  };
}

export async function createCommunity(
  cell: CallableCell,
  community = undefined
): Promise<Record> {
  return cell.callZome({
    zome_name: "communities",
    fn_name: "create_community",
    payload: community || (await sampleCommunity(cell)),
  });
}

test("create Community", async (t) => {
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

    // Alice creates a Community
    const record: Record = await createCommunity(alice.cells[0]);
    t.ok(record);
  });
});

test("create and read Community", async (t) => {
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

    const sample = await sampleCommunity(alice.cells[0]);

    // Alice creates a Community
    const record: Record = await createCommunity(alice.cells[0], sample);
    t.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created Community
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "communities",
      fn_name: "get_community",
      payload: record.signed_action.hashed.hash,
    });
    t.deepEqual(
      sample,
      decode((createReadOutput.entry as any).Present.entry) as any
    );
  });
});

test("create and update Community", async (t) => {
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

    // Alice creates a Community
    const record: Record = await createCommunity(alice.cells[0]);
    t.ok(record);

    const originalActionHash = record.signed_action.hashed.hash;

    // Alice updates the Community
    let contentUpdate: any = await sampleCommunity(alice.cells[0]);
    let updateInput = {
      original_community_hash: originalActionHash,
      previous_community_hash: originalActionHash,
      updated_community: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "communities",
      fn_name: "update_community",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the updated Community
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "communities",
      fn_name: "get_community",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(
      contentUpdate,
      decode((readUpdatedOutput0.entry as any).Present.entry) as any
    );

    // Alice updates the Community again
    contentUpdate = await sampleCommunity(alice.cells[0]);
    updateInput = {
      original_community_hash: originalActionHash,
      previous_community_hash: updatedRecord.signed_action.hashed.hash,
      updated_community: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "communities",
      fn_name: "update_community",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the updated Community
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "communities",
      fn_name: "get_community",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(
      contentUpdate,
      decode((readUpdatedOutput1.entry as any).Present.entry) as any
    );
  });
});

test("create and delete Community", async (t) => {
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

    // Alice creates a Community
    const record: Record = await createCommunity(alice.cells[0]);
    t.ok(record);

    // Alice deletes the Community
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "communities",
      fn_name: "delete_community",
      payload: record.signed_action.hashed.hash,
    });
    t.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);

    // Bob tries to get the deleted Community
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "communities",
      fn_name: "get_community",
      payload: record.signed_action.hashed.hash,
    });
    t.notOk(readDeletedOutput);
  });
});
