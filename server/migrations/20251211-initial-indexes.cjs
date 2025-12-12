module.exports = {
  async up(db) {
    await db.collection('users').createIndexes([
      { key: { handle: 1 }, name: 'users_handle_unique', unique: true },
      { key: { address: 1 }, name: 'users_address_unique', unique: true },
      { key: { createdAt: -1 }, name: 'users_createdAt_desc' }
    ]);
  },

  async down(db) {
    await db.collection('users').dropIndex('users_handle_unique').catch(() => {});
    await db.collection('users').dropIndex('users_address_unique').catch(() => {});
    await db.collection('users').dropIndex('users_createdAt_desc').catch(() => {});
  }
};
