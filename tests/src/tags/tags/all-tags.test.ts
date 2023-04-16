import test from "tape-promise/tape.js";

import { runScenario, pause, CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource,  fakeActionHash, fakeAgentPubKey, fakeEntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { createTagItem } from './tag-item.test.js';

test('create a TagItem and get all tags', async t => {
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

    // Bob gets all tags
    let collectionOutput: Record[] = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_all_tags",
      payload: alice.agentPubKey
    });
    t.equal(collectionOutput.length, 0);

    // Alice creates a TagItem
    const createdRecord: Record = await createTagItem(alice.cells[0]);
    t.ok(createdRecord);
    
    await pause(1200);
    
    // Bob gets all tags again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "tags",
      fn_name: "get_all_tags",
      payload: alice.agentPubKey
    });
    t.equal(collectionOutput.length, 1);
    t.deepEqual(createdRecord, collectionOutput[0]);    
  });
});

