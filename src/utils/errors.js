/** Turns a database error into a message the user can act on. */
export function getDataErrorMessage(error) {
  switch (error?.code) {
    case 'network/timeout':
    case 'unavailable':
      return 'No connection. Check your signal and try again.';
    case 'permission-denied':
      return 'You do not have permission to do that.';
    case 'benchmark/no-data':
      return error.message;
    default:
      return 'Something went wrong. Please try again.';
  }
}
