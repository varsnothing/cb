export const log = (message, type) => {
  if (type === 1) {
    console.log('\x1b[41m cb::error::' + message + ' \x1b[0m');
    return;
  }
  if (type === 2) {
    console.log('\x1b[43m cb::warning::' + message + ' \x1b[0m');
    return;
  }
  if (type === 0) {
    console.log('\x1b[42m cb::success::' + message + ' \x1b[0m');
    return;
  }
  console.log('\x1b[35m cb::message::' + message + ' \x1b[0m');
};
