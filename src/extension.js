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
      const fileName = editor.document.fileName;
      const dot = fileName.lastIndexOf(".");
      const ext = dot > -1 && fileName.substring(dot + 1, fileName.length);
      client.request("transferCode", { code, ext });
    }
  );

  let importSnippetCommand = vscode.commands.registerCommand(
    "extension.importSnippetFromSnippetStore",
    function() {
      const editor = getEditor();
      client.request("getSnippets", {}, snippets => {
        snippets = snippets.snippets;
        const snippetNames = snippets.map(
          snippet =>
            (!snippet.files ? "$(file-code)" : "$(diff)") + ` ${snippet.name}`
        );
        vscode.window.showQuickPick(snippetNames).then(name => {
          if (name) {
            name = name.replace("$(file-code) ", "").replace("$(diff) ", "");
            const snippet = snippets.find(snippet => snippet.name === name);
            const position = editor.selection;
            if (!snippet.files) {
              editor.edit(edit => {
                edit.replace(position, snippet.value);
              });
            } else {
              const fileNames = snippet.files.map(
                file => "$(file-code)" + ` ${file.name}`
              );
              vscode.window.showQuickPick(fileNames).then(fileName => {
                if (fileName) {
                  fileName = fileName.replace("$(file-code) ", "");
                  const file = snippet.files.find(
                    file => file.name === fileName
                  );
                  editor.edit(edit => {
                    edit.replace(position, file.value);
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
