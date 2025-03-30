/*
 * I usually avoid having stateful components,
 * but I think in this context it makes sense to have a closure that handles the chat to DB read and write operations.
 * that way we make the component a drop in solution.
 * for now I keep the chat read write operations in this service, but if this whas a whole integrated app It would make sense to move the DB basic operations to it's own closure.
 */

import { ChatComment, ResolvedChatComment } from '../types';

interface DBClientProps {
  nameSpace: string;
}

export type dbClientReturnTypes = {
  addComment: (comment: Omit<ChatComment, "id">) => Promise<IDBValidKey>;
  removeComment: (commentId: ChatComment["id"]) => void;
  getChatTimeline: () => Promise<ResolvedChatComment[]>;
}

const SCHEMA_VERSION = 1;
async function dbClient({ nameSpace }: DBClientProps) {
  const db = await getDBConnectionAndCreateStores(nameSpace);

  function addComment(comment: Omit<ChatComment, 'id'>): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('comments', 'readwrite');
      const store = transaction.objectStore('comments');
      const req = store.add(comment);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function removeComment(commentId: ChatComment['id']) {
    return console.log('remove comment', commentId);
  }

  function getChatTimeline(): Promise<ResolvedChatComment[]> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('comments', 'readonly');
      const store = tx.objectStore('comments');
      const req = store.getAll();

      req.onsuccess = async () => {
        const allComments: ResolvedChatComment[] = req.result;

        function getChildren(parentId: number): ResolvedChatComment[] {
          return allComments
            .filter(comment => comment.parent === parentId)
            .sort((a, b) => a.id - b.id);
        }

        async function buildCommentTree(parentId: number): Promise<ResolvedChatComment> {
          const parent = allComments.find((comment: ResolvedChatComment) => comment.id === parentId)!;
          const children = getChildren(parentId);
          const nestedChildren = await Promise.all(children.map(child => buildCommentTree(child.id)));
          return { ...parent, children: nestedChildren };
        }

        const rootComments = allComments.filter(comment => !comment.parent).sort((a, b) => a.id - b.id);
        const tree = await Promise.all(rootComments.map(comment => buildCommentTree(comment.id)));
        resolve(tree.reverse());
      };

      req.onerror = () => reject(req.error);
    });
  }

  return {
    addComment,
    removeComment,
    getChatTimeline,
  };
}

function getDBConnectionAndCreateStores(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, SCHEMA_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('comments')) {
        console.log('Created Store')
        return db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('comments')) {
        db.close();
        indexedDB.deleteDatabase(name);
        return reject(new Error('comments store was not created'));
      }
      return resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}


export default dbClient;
