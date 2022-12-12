const vscode = require("vscode");
const axios = require("axios");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const res = await axios.get(
    "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json"
  );

  const kurals = res.data.kural.map((k) => ({
    label: "#" + k.Number + " " + k.Line1 + " * " + k.Line2,
    detail: k.transliteration1 + " * " + k.transliteration2,
    full: k,
  }));

  console.log(kurals.length);

  let kuralObjectCommand = vscode.commands.registerCommand(
    "tamil-lorem.search",
    async function () {
      const kural = await vscode.window.showQuickPick(shuffle(kurals), {
        matchOnDetail: true,
      });

      if (!kural) return;

      insertContent(JSON.stringify(kural.full, null, "\t"));
    }
  );
  context.subscriptions.push(kuralObjectCommand);

  let randomCommand = vscode.commands.registerCommand(
    "tamil-lorem.random",
    async function () {
      const kural = kurals[randomKuralNo()];

      if (!kural) return;

      insertContent(`${kural.full.Line1}\n${kural.full.Line2}`);
    }
  );

  context.subscriptions.push(randomCommand);

  let paraCommand = vscode.commands.registerCommand(
    "tamil-lorem.paragraph",
    async function () {
      const n = await vscode.window.showQuickPick([
        { label: "1" },
        { label: "2" },
        { label: "3" },
        { label: "4" },
        { label: "5" },
        { label: "10" },
        { label: "20" },
      ]);

      let paras = [];

      for (let index = 0; index < n.label; index++) {
        let k = kurals[randomKuralNo()];
        paras.push(k.full.sp);
      }

      if (paras.length == 0) return;
      insertContent(paras.join("\r\n\r\n"));
    }
  );

  context.subscriptions.push(randomCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

function insertContent(content) {
  editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, content);
    });
  }
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function randomKuralNo() {
  return Math.floor(Math.random() * 1330);
}
