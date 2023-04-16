use hdk::prelude::*;
use communities_integrity::*;
#[hdk_extern]
pub fn create_community(community: Community) -> ExternResult<Record> {
    let community_hash = create_entry(&EntryTypes::Community(community.clone()))?;
    for base in community.members.clone() {
        create_link(base, community_hash.clone(), LinkTypes::MemberToCommunities, ())?;
    }
    create_link(
        community.owner.clone(),
        community_hash.clone(),
        LinkTypes::OwnerToCommunities,
        (),
    )?;
    let record = get(community_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Community"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn get_community(
    original_community_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        original_community_hash.clone(),
        LinkTypes::CommunityUpdates,
        None,
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_community_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_community_hash.clone(),
    };
    get(latest_community_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateCommunityInput {
    pub original_community_hash: ActionHash,
    pub previous_community_hash: ActionHash,
    pub updated_community: Community,
}
#[hdk_extern]
pub fn update_community(input: UpdateCommunityInput) -> ExternResult<Record> {
    let updated_community_hash = update_entry(
        input.previous_community_hash.clone(),
        &input.updated_community,
    )?;
    create_link(
        input.original_community_hash.clone(),
        updated_community_hash.clone(),
        LinkTypes::CommunityUpdates,
        (),
    )?;
    let record = get(updated_community_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated Community"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_community(
    original_community_hash: ActionHash,
) -> ExternResult<ActionHash> {
    delete_entry(original_community_hash)
}
#[hdk_extern]
pub fn get_communities_for_member(member: AgentPubKey) -> ExternResult<Vec<Record>> {
    let links = get_links(member, LinkTypes::MemberToCommunities, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(
            ActionHash::from(link.target).into(),
            GetOptions::default(),
        ))
        .collect();
    let records: Vec<Record> = HDK
        .with(|hdk| hdk.borrow().get(get_input))?
        .into_iter()
        .filter_map(|r| r)
        .collect();
    Ok(records)
}
#[hdk_extern]
pub fn get_communities_for_owner(owner: AgentPubKey) -> ExternResult<Vec<Record>> {
    let links = get_links(owner, LinkTypes::OwnerToCommunities, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(
            ActionHash::from(link.target).into(),
            GetOptions::default(),
        ))
        .collect();
    let records: Vec<Record> = HDK
        .with(|hdk| hdk.borrow().get(get_input))?
        .into_iter()
        .filter_map(|r| r)
        .collect();
    Ok(records)
}
