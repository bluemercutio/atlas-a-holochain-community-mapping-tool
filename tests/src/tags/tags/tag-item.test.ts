import test from "tape-promise/tape.js";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource,  fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';


async function sampleTagItem(cell: CallableCell, partialTagItem = {}) {
    return {
        ...{
	  name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
	  coordinates: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        ...partialTagItem
    };
}

export async function createTagItem(cell: CallableCell, tagItem = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "tags",
      fn_name: "create_tag_item",
      payload: tagItem || await sampleTagItem(cell),
    });
}

test('create TagItem', async t => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/atlas.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a TagItem
    const record: Record = await createTagItem(alice.cells[0]);
    t.ok(record);
  });
});

test('create and read TagItem', async t => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/atlas.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    const sample = await sampleTagItem(alice.cells[0]);

    // Alice creates a TagItem
    const record: Record = await createTagItem(alice.cells[0], sample);
    t.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await pause(1200);

    // Bob gets the created TagItem
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_tag_item",
      payload: record.signed_action.hashed.hash,
    });
    t.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);
  });
});

test('create and update TagItem', async t => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/atlas.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a TagItem
    const record: Record = await createTagItem(alice.cells[0]);
    t.ok(record);
        
    const originalActionHash = record.signed_action.hashed.hash;
 
    // Alice updates the TagItem
    let contentUpdate: any = await sampleTagItem(alice.cells[0]);
    let updateInput = {
      original_tag_item_hash: originalActionHash,
      previous_tag_item_hash: originalActionHash,
      updated_tag_item: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "tags",
      fn_name: "update_tag_item",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated TagItem
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_tag_item",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the TagItem again
    contentUpdate = await sampleTagItem(alice.cells[0]);
    updateInput = { 
      original_tag_item_hash: originalActionHash,
      previous_tag_item_hash: updatedRecord.signed_action.hashed.hash,
      updated_tag_item: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "tags",
      fn_name: "update_tag_item",
      payload: updateInput,
    });
    t.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await pause(1200);
        
    // Bob gets the updated TagItem
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_tag_item",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);
  });
});

test('create and delete TagItem', async t => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/atlas.happ';

    // Set up the app to be installed 
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice creates a TagItem
    const record: Record = await createTagItem(alice.cells[0]);
    t.ok(record);
        
    // Alice deletes the TagItem
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "tags",
      fn_name: "delete_tag_item",
      payload: record.signed_action.hashed.hash,
    });
    t.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await pause(1200);
        
    // Bob tries to get the deleted TagItem
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_tag_item",
      payload: record.signed_action.hashed.hash,
    });
    t.notOk(readDeletedOutput);
  });
});
