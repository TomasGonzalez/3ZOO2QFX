/*
 * I usually avoid having statefull components,
 * but I think in this context it makes sense to have a closure that handles the chat to DB read and write operations.
 * that way we make the component a drop in solution.
 * for now I keep the chat read write operations in this service, but if this whas a whole integrated app It would make sense to move the DB basic operations to it's own closure.
 */

interface DBClientProps {
  nameSpace: string;
}

function dbClient({ nameSpace }: DBClientProps) {
  const dbInstance = indexedDB;

  function getConnection() {
    return dbInstance.open(nameSpace);
  }

  function addComment() {
    return console.log('addComment');
  }

  function removeComment() {
    return console.log('Remove comment');
  }

  function getAllComments() {
    return console.log('getAllComments');
  }

  return {
    addComment,
    removeComment,
    getAllComments,
  };
}

export default dbClient;
