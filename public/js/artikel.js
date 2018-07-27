var form = document.getElementById("panta.artikel");
var btSave = document.getElementById("bt_save");
var btDelete = document.getElementById("bt_delete");
var t = TrelloPowerUp.iframe();

btDelete.addEventListener('click', function (event) {
    event.preventDefault();
    return t.remove('card', 'shared', 'panta.Artikel')
        .then(function () {
            t.closeModal();
        });
});

// Get all of the information about the list from a public board
btSave.addEventListener('click', function (event) {
    // Stop the browser trying to submit the form itself.
    event.preventDefault();
    var thema = document.getElementsByName("thema")[0].value;

    var pagina = document.getElementsByName("pagina")[0].value;
    var pageLayout = document.getElementsByName("page_layout")[0].value;
    var pageTotal = document.getElementsByName("page_total")[0].value;

    var textbox = document.getElementsByName("textbox")[0].value;
    var additional = document.getElementsByName("unnamed")[0].value;

    var region = document.getElementsByName("region")[0].value;
    var season = document.getElementsByName("season")[0].value;
    var charCount = document.getElementsByName("char_count")[0].value;

    var option_onsite = document.getElementsByName("option_onsite")[0].checked === true;
    var option_text = document.getElementsByName("option_text")[0].checked === true;
    var option_photo = document.getElementsByName("option_photo")[0].checked === true;
    var option_video = document.getElementsByName("option_video")[0].checked === true;
    var option_illu = document.getElementsByName("option_illu")[0].checked === true;
    var option_pubs = document.getElementsByName("option_pubs")[0].checked === true;

    var saldo_text = document.getElementsByName("saldo_text")[0].checked === true;
    var saldo_photo = document.getElementsByName("saldo_photo")[0].checked === true;
    var saldo_video = document.getElementsByName("saldo_video")[0].checked === true;
    var saldo_illu = document.getElementsByName("saldo_illu")[0].checked === true;
    var saldo_pubs = document.getElementsByName("saldo_pubs")[0].checked === true;

    return t.set('card', 'shared', 'panta.Artikel', {
        "thema": thema,
        "pagina": pagina,
        "pageLayout": pageLayout,
        "pageTotal": pageTotal,
        "textbox": textbox,
        "additional": additional,
        "region": region,
        "season": season,
        "charCount": charCount,
        "options": {
            "onsite": option_onsite,
            "text": option_text,
            "photo": option_photo,
            "video": option_video,
            "illu": option_illu,
            "pubs": option_pubs
        },
        "saldo": {
            "text": saldo_text,
            "photo": saldo_photo,
            "video": saldo_video,
            "illu": saldo_illu,
            "pubs": saldo_pubs
        }
    }).then(function () {
        t.closeModal();
    });
});

t.render(function () {
    return t.get('card', 'shared', 'panta.Artikel')
        .then(function (artikel) {
            if (artikel) {
                document.getElementsByName("thema")[0].value = artikel["thema"];

                document.getElementsByName("pagina")[0].value = artikel["pagina"];
                document.getElementsByName("page_layout")[0].value = artikel["pageLayout"];
                document.getElementsByName("page_total")[0].value = artikel["pageTotal"];

                document.getElementsByName("textbox")[0].value = artikel["textbox"];
                document.getElementsByName("unnamed")[0].value = artikel["additional"];

                document.getElementsByName("region")[0].value = artikel["region"];
                document.getElementsByName("season")[0].value = artikel["season"];
                document.getElementsByName("char_count")[0].value = artikel["charCount"];
                const options = artikel["options"];
                if (options) {
                    document.getElementsByName("option_onsite")[0].checked = options["onsite"] === true;
                    document.getElementsByName("option_text")[0].checked = options["text"] === true;
                    document.getElementsByName("option_photo")[0].checked = options["photo"] === true;
                    document.getElementsByName("option_video")[0].checked = options["video"] === true;
                    document.getElementsByName("option_illu")[0].checked = options["illu"] === true;
                    document.getElementsByName("option_pubs")[0].checked = options["pubs"] === true;
                }
                const saldo = artikel["saldo"];
                if (saldo) {
                    document.getElementsByName("saldo_text")[0].checked = saldo["text"] === true;
                    document.getElementsByName("saldo_photo")[0].checked = saldo["photo"] === true;
                    document.getElementsByName("saldo_video")[0].checked = saldo["video"] === true;
                    document.getElementsByName("saldo_illu")[0].checked = saldo["illu"] === true;
                    document.getElementsByName("saldo_pubs")[0].checked = saldo["pubs"] === true;
                }

            }
        })
        .then(function () {
            return t.card('all')
        })
        .then(function (card) {
            document.getElementById("card_name").innerText = card.name;
            return t.cards('customFieldItems');
        })
        .then(function(customFields) {
            console.log("CustomFields: ");
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
        .then(function(data) {
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