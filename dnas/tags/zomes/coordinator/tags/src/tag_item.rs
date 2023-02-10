use hdk::prelude::*;
use tags_integrity::*;
#[hdk_extern]
pub fn create_tag_item(tag_item: TagItem) -> ExternResult<Record> {
    let tag_item_hash = create_entry(&EntryTypes::TagItem(tag_item.clone()))?;
    let record = get(tag_item_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created TagItem"))
            ),
        )?;
    let my_agent_pub_key = agent_info()?.agent_latest_pubkey;
    create_link(my_agent_pub_key, tag_item_hash.clone(), LinkTypes::AllTags, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_tag_item(original_tag_item_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_tag_item_hash.clone(),
        LinkTypes::TagItemUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_tag_item_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_tag_item_hash.clone(),
    };
    get(latest_tag_item_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateTagItemInput {
    pub original_tag_item_hash: ActionHash,
    pub previous_tag_item_hash: ActionHash,
    pub updated_tag_item: TagItem,
}
#[hdk_extern]
pub fn update_tag_item(input: UpdateTagItemInput) -> ExternResult<Record> {
    let updated_tag_item_hash = update_entry(
        input.previous_tag_item_hash.clone(),
        &input.updated_tag_item,
    )?;
    create_link(
        input.original_tag_item_hash.clone(),
        updated_tag_item_hash.clone(),
        LinkTypes::TagItemUpdates,
        (),
    )?;
    let record = get(updated_tag_item_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated TagItem"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_tag_item(original_tag_item_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_tag_item_hash)
}
