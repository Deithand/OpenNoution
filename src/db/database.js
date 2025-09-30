import Dexie from 'dexie';

// Initialize IndexedDB database
export const db = new Dexie('OpenNoutionDB');

db.version(1).stores({
  pages: '++id, title, parentId, createdAt, updatedAt, position',
  blocks: '++id, pageId, type, content, position, createdAt, updatedAt',
  user: 'id, name, email, avatar, createdAt',
  settings: 'key, value'
});

// Initialize database with error handling
export const initializeDatabase = async () => {
  try {
    await db.open();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Try to delete and recreate
    try {
      await Dexie.delete('OpenNoutionDB');
      await db.open();
      console.log('Database recreated successfully');
      return true;
    } catch (retryError) {
      console.error('Failed to recreate database:', retryError);
      alert('Ошибка инициализации базы данных. Попробуйте перезапустить приложение.');
      return false;
    }
  }
};

// User profile management
export const getUserProfile = async () => {
  const users = await db.user.toArray();
  return users[0] || null;
};

export const saveUserProfile = async (profile) => {
  await db.user.clear();
  return await db.user.add({
    id: 'user-1',
    ...profile,
    createdAt: new Date().toISOString()
  });
};

// Settings management
export const getSetting = async (key) => {
  const setting = await db.settings.get(key);
  return setting ? setting.value : null;
};

export const saveSetting = async (key, value) => {
  return await db.settings.put({ key, value });
};

// Page management
export const createPage = async (title, parentId = null) => {
  const now = new Date().toISOString();
  const position = await getNextPagePosition(parentId);
  
  return await db.pages.add({
    title: title || 'Untitled',
    parentId,
    position,
    createdAt: now,
    updatedAt: now
  });
};

export const getPages = async () => {
  return await db.pages.orderBy('position').toArray();
};

export const getPage = async (id) => {
  return await db.pages.get(id);
};

export const updatePage = async (id, updates) => {
  return await db.pages.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deletePage = async (id) => {
  // Delete page and all its blocks
  await db.blocks.where('pageId').equals(id).delete();
  // Delete all child pages recursively
  const children = await db.pages.where('parentId').equals(id).toArray();
  for (const child of children) {
    await deletePage(child.id);
  }
  return await db.pages.delete(id);
};

const getNextPagePosition = async (parentId) => {
  let pages;
  if (parentId === null || parentId === undefined) {
    // Для корневых страниц (без родителя)
    pages = await db.pages.filter(p => p.parentId === null || p.parentId === undefined).toArray();
  } else {
    pages = await db.pages.where('parentId').equals(parentId).toArray();
  }
  if (pages.length === 0) return 0;
  return Math.max(...pages.map(p => p.position)) + 1;
};

// Block management
export const createBlock = async (pageId, type = 'text', content = '', position = null) => {
  const now = new Date().toISOString();
  
  if (position === null) {
    const blocks = await db.blocks.where('pageId').equals(pageId).toArray();
    position = blocks.length;
  }
  
  return await db.blocks.add({
    pageId,
    type,
    content,
    position,
    createdAt: now,
    updatedAt: now
  });
};

export const getBlocks = async (pageId) => {
  return await db.blocks
    .where('pageId')
    .equals(pageId)
    .sortBy('position');
};

export const updateBlock = async (id, updates) => {
  return await db.blocks.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const deleteBlock = async (id) => {
  return await db.blocks.delete(id);
};

export const reorderBlocks = async (pageId, blockIds) => {
  const updates = blockIds.map((id, index) => 
    db.blocks.update(id, { position: index })
  );
  return await Promise.all(updates);
};

// Export/Import functionality
export const exportAllData = async () => {
  const pages = await db.pages.toArray();
  const blocks = await db.blocks.toArray();
  const user = await getUserProfile();
  const settings = await db.settings.toArray();
  
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {
      pages,
      blocks,
      user,
      settings
    }
  };
};

export const importAllData = async (backupData) => {
  try {
    const { data } = backupData;
    
    // Clear existing data
    await db.pages.clear();
    await db.blocks.clear();
    await db.user.clear();
    await db.settings.clear();
    
    // Import new data
    if (data.pages) await db.pages.bulkAdd(data.pages);
    if (data.blocks) await db.blocks.bulkAdd(data.blocks);
    if (data.user) await db.user.add(data.user);
    if (data.settings) await db.settings.bulkAdd(data.settings);
    
    return { success: true };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
};
