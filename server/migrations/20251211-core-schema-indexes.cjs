module.exports = {
  async up(db) {
    await db.collection('users').dropIndex('users_handle_unique').catch(() => {});
    await db.collection('users').createIndexes([
      { key: { address: 1 }, name: 'users_address_unique', unique: true },
      { key: { handle: 1 }, name: 'users_handle_unique', unique: true, partialFilterExpression: { handle: { $type: 'string' } } },
      { key: { createdAt: -1 }, name: 'users_createdAt_desc' },
    ]);

    await db.collection('quests').createIndexes([
      { key: { slug: 1 }, name: 'quests_slug_unique', unique: true },
      { key: { status: 1 }, name: 'quests_status' },
      { key: { category: 1, displayOrder: 1 }, name: 'quests_category_displayOrder' },
      { key: { startsAt: 1 }, name: 'quests_startsAt' },
      { key: { endsAt: 1 }, name: 'quests_endsAt' },
    ]);

    await db.collection('participations').createIndexes([
      { key: { userId: 1, questId: 1 }, name: 'participations_user_quest_unique', unique: true },
      { key: { status: 1 }, name: 'participations_status' },
      { key: { updatedAt: -1 }, name: 'participations_updatedAt_desc' },
    ]);

    await db.collection('distributions').createIndexes([
      { key: { userId: 1, questId: 1, type: 1 }, name: 'distributions_user_quest_type' },
      { key: { status: 1 }, name: 'distributions_status' },
      { key: { txHash: 1 }, name: 'distributions_txHash' },
      { key: { createdAt: -1 }, name: 'distributions_createdAt_desc' },
    ]);
  },

  async down(db) {
    for (const [col, idx] of [
      ['users', ['users_address_unique', 'users_handle_unique', 'users_createdAt_desc']],
      ['quests', ['quests_slug_unique', 'quests_status', 'quests_category_displayOrder', 'quests_startsAt', 'quests_endsAt']],
      ['participations', ['participations_user_quest_unique', 'participations_status', 'participations_updatedAt_desc']],
      ['distributions', ['distributions_user_quest_type', 'distributions_status', 'distributions_txHash', 'distributions_createdAt_desc']],
    ]) {
      for (const name of idx) {
        await db.collection(col).dropIndex(name).catch(() => {});
      }
    }
  }
};
