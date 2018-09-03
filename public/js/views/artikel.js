// let btSave = document.getElementById("bt_save");
let btDelete = document.getElementById("bt_delete");
let t = TrelloPowerUp.iframe();

if (btDelete) {
    btDelete.addEventListener('click', function (event) {
        event.preventDefault();
        return t.remove('card', 'shared', ArtikelController.SHARED_NAME)
            .then(function () {
                t.closeModal();
            });
    });
}

function showTab(what) {
    var content = document.getElementById("tab-content");
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    var input = document.createElement("textarea");
    input.setAttribute("name", what + "_data");
    input.setAttribute("placeholder", "Eingabefeld für " + what);
    if (panta) {
        var options = panta["options"];
        if (options && options[what + "_data"]) {
            input.appendChild(document.createTextNode(options[what + "_data"]));
        }
    }
    content.appendChild(input);
}

// Get all of the information about the list from a public board
// btSave.addEventListener('click', function (event) {
//     // Stop the browser trying to submit the form itself.
//     event.preventDefault();
//     return t.set('card', 'shared', ArtikelController.SHARED_NAME, articleController.getArtikel());
// });

let articleController = new ArtikelController(document, t);
let om = new JsonSerialization();

t.render(function () {
    return t.get('card', 'shared', ArtikelController.SHARED_NAME)
        .then(function (jsonobj) {
            let artikel = new Artikel();
            om.deserialize(om.serialize(jsonobj), artikel);
            articleController.render(artikel);
        })
        .then(function () {
            return t.card('all')
        })
        .then(function (card) {
            return t.cards('customFieldItems');
        })
        .then(function (customFields) {
            console.log(JSON.stringify(customFields));
            var Promise = window.TrelloPowerUp.Promise;
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest;
                xhr.addEventListener("error", reject);
                xhr.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject({
                            status: this.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.open("GET", "https://api.trello.com/1/cards/5b49a8c00e5a2f4f5ba0111e/customFields?key=86a73cafa11d3834d4768a20a96b6786&token=5f7ab7be941155ed024f3d024a5043d198c23764c9ee5988543d4679dc411563");
                xhr.send(null);
            });
        })
        .then(function (data) {
            var fields = JSON.parse(data);
            for (var cf in fields) {
                var name = fields[cf].name;
                var elname = document.getElementsByName(name);
                if (elname && elname[0]) {
                    var selectname = document.createElement("select");
                    for (var opt in fields[cf].options) {
                        var optname = document.createElement("option");
                        optname.value = fields[cf].options[opt].value.text;
                        optname.appendChild(document.createTextNode(fields[cf].options[opt].value.text));
                        selectname.appendChild(optname);
                    }
                    elname[0].style.display = "none";
                    elname[0].parentElement.appendChild(selectname);
                }
                console.log("Region: " + JSON.stringify(fields[cf].name));
            }
        })
        .then(function () {
            t.sizeTo('#panta\\.artikel').done();
        })
});
