TrelloPowerUp.initialize({
    'card-buttons': function (t, options) {
        return [{
            icon: './assets/ic_pantarhei.png',
            text: 'panta.Card',
            callback: function (t) {
                return t.popup({
                    title: "Einstellungen",
                    url: "settings.html"
                })
            }
        }];
    },
    'card-badges': function (t, options) {
        window.articleController = new ArtikelController(document, t);
        return t.card('id')
            .then(function (card) {
                return t.get(card.id, 'shared', ArtikelController.SHARED_NAME)
                    .then(function (list_data) {
                        return Artikel.create(list_data);
                    })
                    .then(function (artikel) {
                        window.articleController.insert(artikel, card);
                        return card;
                    });
            })
            .then(function (card) {
                let badges = [];
                let artikel = window.articleController.getByCard(card);
                let counter = artikel.getInvolvedCount();

                if (counter > 0) {
                    badges.push({
                        text: "",
                        icon: './assets/ic_artikel.png'
                    });
                    badges.push({
                        text: counter,
                        icon: './assets/ic_beteiligt.png'
                    });
                    if (artikel.region) {
                        badges.push({
                            text: 'region: ' + artikel.region,
                            color: 'sky'
                        });
                    }
                    if (artikel.tags) {
                        badges.push({
                            text: 'online: ' + artikel.tags,
                            color: 'blue'
                        });
                    }
                }

                return badges;
            })
    },
    'card-back-section': function (t, opts) {
        // Your Power-Up can have only one card back section and a maximum height of 500 pixels.
        return [{
            title: 'Artikel',
            icon: './assets/ic_pantarhei.png',
            content: {
                type: 'iframe',
                url: t.signUrl('./artikel.html', {}),
                height: 500 // Max height is 500
            }
        }]
    },
    'list-sorters': function (t) {
        window.articleController = new ArtikelController(document, t);
        return t.cards('id')
            .each(function (card) {
                return t.get(card.id, 'shared', ArtikelController.SHARED_NAME)
                    .then(function (list_data) {
                        return Artikel.create(list_data);
                    })
                    .then(function (artikel) {
                        window.articleController.insert(artikel, card);
                        return window.articleController;
                    });
            })
            .then(function (list) {
                return [{
                    text: "Pagina (1 -> 99)",
                    callback: function (t, opts) {
                        return sortOnPagina(t, opts, "asc");
                    }
                }, {
                    text: "Online (A -> Z)",
                    callback: function (t, opts) {
                        return sortOnTags(t, opts, "asc");
                    }
                }];
            });
    }
});

function sortOnPagina(t, opts, sort) {
    // Trello will call this if the user clicks on this sort
    // opts.cards contains all card objects in the list
    let sortedCards = opts.cards.sort(
        function (lhs_card, rhs_card) {
            let lhs = window.articleController.getByCard(lhs_card);
            let rhs = window.articleController.getByCard(rhs_card);
            let lhsp = parseInt(lhs.pagina || "0");
            let rhsp = parseInt(rhs.pagina || "0");
            if (lhsp > rhsp) {
                return sort === "asc" ? 1 : -1;
            } else if (rhsp > lhsp) {
                return sort === "asc" ? -1 : 1;
            }
            return 0;
        });

    return {
        sortedIds: sortedCards.map(function (c) {
            return c.id;
        })
    };
}

function sortOnTags(t, opts, sort) {
    // Trello will call this if the user clicks on this sort
    // opts.cards contains all card objects in the list
    let sortedCards = opts.cards.sort(
        function (lhs_card, rhs_card) {
            let lhs = window.articleController.getByCard(lhs_card);
            let rhs = window.articleController.getByCard(rhs_card);
            let lhsp = map(lhs.tags);
            let rhsp = map(rhs.tags);
            if (lhsp > rhsp) {
                return sort === "asc" ? 1 : -1;
            } else if (rhsp > lhsp) {
                return sort === "asc" ? -1 : 1;
            }
            return 0;
        });

    return {
        sortedIds: sortedCards.map(function (c) {
            return c.id;
        })
    };
}

function map(tag) {
    if (!tag) {
        return -1;
    }
    switch (tag) {
        case "monday":
            return 0;
        case "tuesday":
            return 1;
        case "wednesday":
            return 2;
        case "thursday":
            return 3;
        case "friday":
            return 4;
        case "saturday":
            return 5;
        case "sunday":
            return 6;
        default:
            return 7;
    }
}

//
// function GET(path) {
//     return new Promise(function (resolve, reject) {
//         let xhr = new XMLHttpRequest;
//         xhr.addEventListener("error", reject);
//         xhr.onload = function () {
//             if (this.status >= 200 && this.status < 300) {
//                 resolve(xhr.response);
//             } else {
//                 reject({
//                     status: this.status,
//                     statusText: xhr.statusText
//                 });
//             }
//         };
//         const key = "86a73cafa11d3834d4768a20a96b6786";
//         const token = "5f7ab7be941155ed024f3d024a5043d198c23764c9ee5988543d4679dc411563"
//         xhr.open("GET", "https://api.trello.com/1" + path + "?key=" + key + "&token=" + token);
//         xhr.send(null);
//     });
// }