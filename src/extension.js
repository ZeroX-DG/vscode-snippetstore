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
  let transferSnippetCommand = vscode.commands.registerCommand(
    "extension.transferToSnippetStore",
    function() {
      const editor = getEditor();
      const code = getSelectedText(editor);
      client.request("transferCode", { code: code });
    }
  );

  let importSnippetCommand = vscode.commands.registerCommand(
    "extension.importSnippetFromSnippetStore",
    function() {
      const editor = getEditor();
      client.request("getSnippets", {}, snippets => {
        snippets = snippets.snippets;
        const snippetNames = snippets.map(snippet => snippet.name);
        vscode.window.showQuickPick(snippetNames).then(name => {
          if (name) {
            const snippet = snippets.find(snippet => snippet.name === name);
            const position = editor.selection.active;
            if (!snippet.files) {
              editor.edit(edit => {
                edit.insert(position, snippet.value);
              });
            } else {
              const fileNames = snippet.files.map(file => file.name);
              vscode.window.showQuickPick(fileNames).then(fileName => {
                if (fileName) {
                  const file = snippet.files.find(
                    file => file.name === fileName
                  );
                  editor.edit(edit => {
                    edit.insert(position, file.value);
                  });
                }
              });
            }
          }
        });
      });
    }
  );

  context.subscriptions.push(transferSnippetCommand, importSnippetCommand);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
