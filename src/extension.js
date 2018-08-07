const vscode = require("vscode");
const messenger = require("messenger");

const client = messenger.createSpeaker(2041);

function getEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  return editor;
}

function getSelectedText(editor) {
  const selection = editor.selection;
  let text = editor.document.getText(selection);
  return text;
}

function activate(context) {
  let transferCommand = vscode.commands.registerCommand(
    "extension.transferToSnippetStore",
    function() {
      const editor = getEditor();
      const code = getSelectedText(editor);
      client.request("transferCode", { code: code });
    }
  );

  context.subscriptions.push(transferCommand);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
