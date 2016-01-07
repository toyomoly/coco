$(function () {
    // ライブラリ
    var common = Coco.Common;

    var ItemObject = function (item) {
        this._item = item;
        this._dom = null;
        this.id = item.id;
        this.isDom = false;
    }
    ItemObject.prototype = {
        createDom: function () {
            var item = this._item;

            this._dom = $("<li></li>").addClass("theme" + item.statusCd).attr("data-id", item.id)
            .append($("<div></div>").addClass("block-a")
                .append($("<div></div>").addClass("block-a-1").append(item.imgTag))
            )
            .append($("<div></div>").addClass("block-b")
                .append($("<div></div>").addClass("block-b-1 textdata small").text(item.id))
                .append($("<div></div>").addClass("block-b-2 textdata large").text(item.name))
                .append($("<div></div>").addClass("block-b-3 textdata small").text(item.kana))
            )
            .append($("<div></div>").addClass("block-d")
                .append($("<div></div>").addClass("block-d-1 textdata").text(item.section))
                .append($("<div></div>").addClass("block-d-2 textdata").text(item.rank))
                .append($("<div></div>").addClass("block-d-3 textdata").append(item.phone))
            )
            .append($("<div></div>").addClass("block-e")
                .append($("<div></div>").addClass("block-e-1")
                    .append(TheSekiList[item.id.toLowerCase()] ? common.createButton("座席", "showmap").hover(
                        function () {
                            $("#TheSekiMap").attr("src", "./mapmini?id=" + item.id.toLowerCase()).addClass("show");
                        },
                        function () {
                            $("#TheSekiMap").attr("src", "").removeClass("show");
                        }
                    ) : "")
                )
            )
            .append($("<div></div>").addClass("block-o")
                .append($("<div></div>").addClass("block-o-1")
                    .append(common.createButton(item.status))
                )
            )
            .append($("<div></div>").addClass("block-p")
                .append($("<div></div>").addClass("block-p-1 textdata").text(item.jotai))
                .append(Manager.UpdateBackup[item.id] ? $("<div></div>").addClass("block-p-z")
                    .append(common.createButton("", "undo mini", "ui-icon-back"))
                : "")
                .append($("<div></div>").addClass("block-p-2 textdata").text(item.yukisaki))
                .append($("<div></div>").addClass("block-p-3 textdata").text(item.nichiji))
                .append($("<div></div>").addClass("block-p-y").text(item.lastUpdate))
            );

            this.isDom = true;
            return this._dom;
        },

        edit: function (copyItem) {
            var item = copyItem || this._item;
            var target_li = this._dom;
            var newStatusCd = item.statusCd;
            var self = this;

            // マネージャーに登録
            Manager.startEdit(function () {
                target_li.find(".block-s").remove();
                target_li.find(".block-o, .block-p").exShow();
                target_li.removeClass("edit");
            });

            target_li.addClass("edit");

            // 元の要素を非表示
            target_li.find(".block-o, .block-p").exHide();

            // 編集用要素を追加
            target_li.append($("<div></div>").addClass("block-s")
                .append($("<div></div>").addClass("block-s-1")
                    .append(common.createButton("社内", "select selectStatus", "ui-icon-radio").addClass(item.statusCd == "1" ? "on" : "").attr("data-statusCd", "1"))
                    .append(common.createButton("社外", "select selectStatus", "ui-icon-radio").addClass(item.statusCd == "2" ? "on" : "").attr("data-statusCd", "2"))
                    .append(common.createButton("休暇", "select selectStatus", "ui-icon-radio").addClass(item.statusCd == "3" ? "on" : "").attr("data-statusCd", "3"))
                    .append(common.createButton("帰宅", "select selectStatus", "ui-icon-radio").addClass(item.statusCd == "4" ? "on" : "").attr("data-statusCd", "4"))
                )
                .append($("<div></div>").addClass("block-s-2")
                    .append(common.createTextBox({
                        val: item.jotai,
                        placeholder: "例：会議、出張など"
                    }))
                    .append(common.createButton("", "select editSelectButton", "ui-icon-carat-d").on("click", function (e) {
                        Manager.PopupJotai.open(function (v) {
                            target_li.find(".block-s-2 input").val(v).change();
                        });
                    }))
                )
                .append($("<div></div>").addClass("block-s-3")
                    .append(common.createTextBox({
                        val: item.yukisaki,
                        placeholder: "例：○○会議室、△△市など"
                    }))
                    .append(common.createButton("", "select editSelectButton", "ui-icon-carat-d").on("click", function (e) {
                        Manager.PopupYukisaki.open(function (v) {
                            target_li.find(".block-s-3 input").val(v).change();
                        });
                    }))
                )
                .append($("<div></div>").addClass("block-s-4")
                    .append(common.createTextBox({
                        val: item.nichiji,
                        placeholder: "例：～10:00、NRなど"
                    }))
                    .append(common.createButton("", "select editSelectButton", "ui-icon-carat-d").on("click", function (e) {
                        Manager.PopupNichiji.open(function (v) {
                            target_li.find(".block-s-4 input").val(v).change();
                        });
                    }))
                )
                .append($("<div></div>").addClass("block-s-5")
                    .append(common.createButton("取消", "cancel").on("click", function (e) {
                        Manager.cancelEdit();
                    }))
                    .append(common.createButton("更新", "update").on("click", function (e) {
                        var j = target_li.find(".block-s-2 input");
                        var y = target_li.find(".block-s-3 input");
                        var n = target_li.find(".block-s-4 input");
                        Manager.setStatus(self._item.id, newStatusCd, j.val(), y.val(), n.val());
                        Manager.update();
                        return false;
                    }))
                )
            )
            .on("click", "a.button.selectStatus", function (e) {
                var t = $(this);
                t.siblings().removeClass("on");
                t.addClass("on");
                newStatusCd = t.attr("data-statusCd");
            });
        },

        update: function (item) {
            this._item = item;
            if (this.isDom) {
                this._dom.removeClass().addClass("theme" + item.statusCd);
                this._dom.find(".block-o .block-o-1 a.button").text(item.status);
                this._dom.find(".block-p .block-p-1.textdata").text(item.jotai);
                this._dom.find(".block-p .block-p-2.textdata").text(item.yukisaki);
                this._dom.find(".block-p .block-p-3.textdata").text(item.nichiji);
                this._dom.find(".block-p .block-p-y").text(item.lastUpdate);
            }
        }
    }

    // リストアイテム
    var ListItem = {

        init: function () {
            var self = this;
            var id = "";
            var btnSize = { x: 46, y: 32 }
            var copy_item = null;

            var temp = [];
            var cancel = function () {
                while (temp.length > 0) {
                    temp.pop()();
                }
            }
            var open = function (offset) {
                if (offset) {
                    updateStatusBox.css({
                        "left": (offset.left) + "px",
                        "top": (offset.top) + "px"
                    });
                }
                updateStatusBox.addClass("openmenu");
            }
            var close = function () {
                updateStatusBox.removeClass("openmenu");
                cancel();
            }

            var updateStatusBox = $("#UpdateStatusBox")
                .append(common.createButton("社内", "updateDirect").attr("data-statusCd", "1").attr("id", "UpdateStatusBox-BtnUpdate1"))
                .append(common.createButton("帰宅", "updateDirect").attr("data-statusCd", "4").attr("id", "UpdateStatusBox-BtnUpdate4"))
                .append(common.createButton("編集", "edit").attr("id", "UpdateStatusBox-BtnEdit"))
                .append(common.createButton("Copy", "copy").attr("id", "UpdateStatusBox-BtnCopy"))
                .append(common.createButton("Paste", "paste hidden").attr("id", "UpdateStatusBox-BtnPaste"))
                .append($("<div></div>").addClass("anti-hover"))
            .on("click", "a.button.updateDirect", function () {
                Manager.updateDirect(id, $(this).attr("data-statusCd"));
                close();
            })
            .on("click", "a.button.edit", function () {
                self._selectedItemObjs.some(function (itemObj) {
                    if (itemObj.id == id) {
                        itemObj.edit();
                        close();
                        return true;
                    }
                });
            })
            .on("click", "a.button.copy", function () {
                var item = Manager.getListItemById(id);
                if (item) {
                    copy_item = item;
                    updateStatusBox.find("a.button.paste").exShow();
                    alert(item.name + "(" + item.id + ") の内容をコピーしました。\n[Paste] ボタンで貼り付けます。");
                    close();
                }
            })
            .on("click", "a.button.paste", function () {
                if (Manager.option.exDirectPaste) {
                    Manager.setStatus(id, copy_item.statusCd, copy_item.jotai, copy_item.yukisaki, copy_item.nichiji);
                    Manager.update();
                    close();
                } else {
                    self._selectedItemObjs.some(function (itemObj) {
                        if (itemObj.id == id) {
                            itemObj.edit(copy_item);
                            close();
                            return true;
                        }
                    });
                }
            })
            .hover(function () { open(); }, close);

            $("#MainPanel").append(updateStatusBox).hover(function () {}, close);

            $("#ListPanel").on("click", ".more", function () {
                self._appendListDom();
            })
            .on("click", "li .block-e .block-e-1 a.button.showmap", function () {
                var tempId = $(this).closest("li").attr("data-id").toLowerCase();
                window.open("./map?id=" + tempId, "showpos");
            })
            .on("click", "li .block-p .block-p-z a.button.undo", function () {
                var tempId = $(this).closest("li").attr("data-id");
                var bk = Manager.UpdateBackup[tempId];
                Manager.setStatus(tempId, bk.statusCd, bk.jotai, bk.yukisaki, bk.nichiji);
                Manager.update();
            })
            .on("mouseover click", "li .block-o .block-o-1", function () {
                var t = $(this);
                var o = t.offset();
                var li = t.closest("li");
                id = li.attr("data-id");

                open(o);
                cancel();
                li.addClass("openmenu");
                temp.push(function () {
                    li.removeClass("openmenu");
                });
            });

            // 下までスクロールしたら追加表示
            var inner = $("#ListPanelInnerBox");
            var ListPanel = $("#ListPanel");
            ListPanel.on("scroll", function () {
                var scrollHeight = inner.height();
                var scrollPosition = ListPanel.height() + ListPanel.scrollTop();
                if (scrollHeight - scrollPosition < 50) {
                    //スクロールが下から50px以内に来た場合
                    self._appendListDom(5);
                }
            });
        },

        _sortKey: "",
        _sortAsc: true,
        setSort: function (key, asc) {
            this._sortKey = key;
            this._sortAsc = asc;
            this.Reselect();
        },

        ReselectBySearch: function (selectFunc) {
            this._selectFunc = function () {
                var selected = [];
                return Manager.List.filter(function (item, i) {
                    if ($.inArray(item.id, selected) > -1) { return false; }
                    if (selectFunc(item)) {
                        selected.push(item.id);
                        return true;
                    } else {
                        return false;
                    }
                });
            }
            this.Reselect();
        },
        ReselectByList: function (ids) {
            this._selectFunc = function () {
                return $.map(ids, function (id, j) {
                    return Manager.getListItemById(id);
                });
            }
            this.Reselect();
        },

        Reselect: function () {

            // 編集キャンセル
            Manager.cancelEdit();

            // リスト選択
            this._selectedItemObjs = this._getNewItems().map(function (item) {
                return new ItemObject(item);
            });

            // リストの初期化
            this._empty();
            // リストに要素追加
            this._isMore = true;
            this._appendListDom();

            // パネルの表示
            $("[data-panelType=mainContents]").exHide();
            $("#ListPanel").exShow();

            // オプション
            Manager.option.exReselect.forEach(function (scr, i) {
                scr();
            });
        },
        _selectFunc: function () { return []; },
        _selectedItemObjs: [],
        _isMore: false,
        _appendListDom: function (max) {
            max = max || 20;
            var m = $("#ListPanel .more");
            var cnt = 0;
            this._isMore = this._isMore && this._selectedItemObjs.some(function (itemObj) {
                if (!itemObj.isDom) {
                    if (cnt < max) {
                        m.before(itemObj.createDom());
                        cnt++;
                    } else {
                        // DOM未生成アイテムがある
                        return true;
                    }
                }
            });
            if (this._isMore) {
                m.exShow();
            } else {
                m.exHide();
            }
        },
        _empty: function () {
            $("#ListPanel li").remove();
        },

        _getNewItems: function () {
            var items = this._selectFunc();

            // ソート
            if (this._sortKey) {
                var key = this._sortKey;
                var asc = (this._sortAsc) ? 1 : -1;
                items.sort(function (a, b) {
                    if (a[key] < b[key]) { return -1 * asc; }
                    if (a[key] > b[key]) { return 1 * asc; }
                    return 0;
                });
            }

            return items;
        },

        update: function () {
            var items = this._getNewItems();
            if (items.length != this._selectedItemObjs.length) {
                // console.log("Length different. " + items.length + " != " + this._selectedItemObjs.length);
                this.Reselect();
                return;
            }
            this._selectedItemObjs.forEach(function (itemObj, i) {
                itemObj.update(items[i]);
            });
        }
    }

    // 更新時刻
    var UpdateTime = {
        init: function () {
            $("#LastUpdate").on("click", function () {
                Manager.reload();
            });
            // this.refreshTime();
        },
        waiting: function () {
            $("#LastUpdate").addClass("waiting");
        },
        refreshTime: function () {
            $("#LastUpdate").removeClass("waiting");
            $("#LastUpdateTime").text(common.getTime());
        }
    }

    // 検索
    var Search = {
        createSection: function () {
            var ul = $("#SelectSectionList");

            ul.append($("<li></li>").text("デフォルト").attr("data-sectionType", "myList").attr("data-selected", "false"));
            Manager.SectionList.forEach(function (s, i) {
                ul.append($("<li></li>").text(s[0]).attr("data-sectionType", "normal").attr("data-selected", "false").attr("data-sectionValue", s[1]));
            });
            ul.append($("<li></li>").attr("data-sectionType", "last").addClass("openBtn ui-icon-carat-d"));
            ul.append($("<li></li>").attr("data-sectionType", "last").addClass("closeBtn ui-icon-carat-u"));

            this.resetSection();
            $("#SelectSectionList li:not(.hidden)").first().trigger("click");
        },

        resetSection: function () {
            $("#SelectSectionList li").exHide();
            if (Manager.option.myList.length > 0) {
                $("#SelectSectionList li[data-sectionType=myList]").exShow();
                // ホームボタン
                $("#HomeIcon").exShow();
            } else {
                // ホームボタン
                $("#HomeIcon").exHide();
            }
            if (Manager.option.mySection.length > 0) {
                $("#SelectSectionList li[data-sectionType=normal]").each(function (i, t) {
                    var s = $(t);
                    if ($.inArray(s.text(), Manager.option.mySection) > -1) {
                        s.exShow();
                    }
                });
                $("#SelectSectionList li.openBtn[data-sectionType=last]").exShow();
            } else {
                $("#SelectSectionList li[data-sectionType=normal]").exShow();
            }
        },

        _changeSection: function () {
            var li = $("#SelectSectionList li[data-selected=true]");
            var newSection = li.text();
            Search.setKeyword(newSection, false);

            switch (li.attr("data-sectionType")) {
                case "myList":
                    ListItem.ReselectByList(Manager.option.myList);
                    break;
                case "normal":
                    var v = li.attr("data-sectionValue");
                    ListItem.ReselectBySearch(function (item) {
                        return (item.section == v);
                    });
                    break;
                default:
            }
        },

        _isLock: false,
        _openList: function (isLock) {
            if (isLock) {
                $("#DownIcon").removeClass("ui-icon-carat-d").addClass("ui-icon-carat-u lock");
                this._isLock = isLock;
            }
            $("#SelectSectionList").addClass("open");
        },

        _closeList: function (isForce) {
            if (this._isLock && !isForce) {
                return;
            }
            $("#SelectSectionList").removeClass("open");
            if (this._isLock) {
                this._isLock = false;
                $("#DownIcon").removeClass("ui-icon-carat-u lock").addClass("ui-icon-carat-d");
            }
            // よく使う部署の初期化
            this.resetSection();
        },

        init: function () {
            var self = this;
            var ul = $("#SelectSectionList");

            ul.on("click", "li[data-sectionType=myList],li[data-sectionType=normal]", function (e) {
                $("#SelectSectionList li[data-selected=true]").attr("data-selected", "false");
                $(e.target).attr("data-selected", "true");
                self._changeSection();
                self._closeList(true);
                return false;
            })
            .on("click", "li.openBtn[data-sectionType=last]", function (e) {
                $("#SelectSectionList li[data-sectionType=normal]").exShow();
                $("#SelectSectionList li.openBtn[data-sectionType=last]").exHide();
                $("#SelectSectionList li.closeBtn[data-sectionType=last]").exShow();
                return false;
            })
            .on("click", "li.closeBtn[data-sectionType=last]", function (e) {
                self.resetSection();
                return false;
            });

            $("#SearchInputBox").prepend(common.createTextBox({
                id: "SearchKeyword",
                placeholder: "検索ワードを入力"
            }));

            var icon = $("#DownIcon");
            icon.hover(function () {
                self._openList(false);
            }, function () {
                self._closeList(false);
            }).on("click", function () {
                if (self._isLock) {
                    self._closeList(true);
                } else {
                    self._openList(true);
                }
            });
            $("#SearchKeyword").on("change keyup", this._search);
            $("#SearchIcon").on("click", this._search);
            // ソートボタン
            var sortKey = "";
            $("#SortIcon").text("sort").on("click", function (e) {
                switch (sortKey) {
                    case "id":
                        sortKey = "kana";
                        $("#SortIcon").text("あ↓");
                        break;
                    case "kana":
                        sortKey = "";
                        $("#SortIcon").text("sort");
                        break;
                    case "":
                    default:
                        sortKey = "id";
                        $("#SortIcon").text("ID↓");
                }
                ListItem.setSort(sortKey, true);
            });
            // ホームボタン
            $("#HomeIcon").on("click", function (e) {
                if (Manager.option.myList.length > 0) {
                    $("#SelectSectionList li[data-selected=true]").attr("data-selected", "false");
                    $("#SelectSectionList li[data-sectionType=myList]").attr("data-selected", "true");
                    self._changeSection();
                }
                return false;
            });
        },
        setKeyword: function (v, exec) {
            $("#SearchKeyword").val(v).change();
            if (exec) {
                this._search();
            }
        },
        _keyword: null,
        _search: function () {
            var newKeyword = $("#SearchKeyword").val().toLowerCase().replace("　", " ");
            if (this._keyword == newKeyword) {
                return;
            }
            this._keyword = newKeyword;
            var v = newKeyword.split(" ");
            ListItem.ReselectBySearch(function (item) {
                for (var j = 0, len = v.length; j < len; j++) {
                    if (!(
                        (item.id.toLowerCase().indexOf(v[j]) > -1) ||
                        (item.name.indexOf(v[j]) > -1) ||
                        (item.section.indexOf(v[j]) > -1) ||
                        (item.kana.indexOf(v[j]) > -1) ||
                        (item.phone.toLowerCase().substr(item.phone.indexOf("&nbsp;") + 6).indexOf(v[j]) > -1) ||
                        (item.sectionCd.toLowerCase() == v[j]) ||
                        (item.rank.indexOf(v[j]) > -1)
                    )) {
                        return false;
                    }
                }
                // 全てのキーワードにマッチ
                return true;
            });
        }
    }

    // コンフィグ
    var Config = {
        MyList: {
            _init: false,

            // 該当者検索
            _searchId: function (inputId, dispName) {
                dispName.text("");
                var id = inputId.val().toUpperCase();
                var item = Manager.getListItemById(id);
                if (item) {
                    dispName.text(item.name);
                    inputId.val(item.id);
                }
            },

            _create: function () {
                var self = this;
                var box = $("#ConfigMyList .inputBox");
                var add = function (val) {
                    val = val || "";
                    var b = common.createTextBox({
                        val: val,
                        placeholder: "社員番号"
                    });
                    var inputId = b.find("input").addClass("inputId");
                    var dispName = $("<div></div>").addClass("dispName");
                    box.append($("<div></div>").addClass("inputLine")
                        .append(b)
                        .append(dispName)
                    );
                    if (val != "") {
                        self._searchId(inputId, dispName);
                    }
                }
                var remove = function () {
                    box.find(".inputLine").last().remove();
                }
                var checkInput = function () {
                    // ラストが入力されたら次のinputを追加する
                    var i = $("#ConfigMyList .inputBox input.inputId");
                    if (i.last().val() != "") {
                        add();
                    }
                    // ラスト２つ続けて空白なら片方削除する
                    while ((i.eq(-2).val() == "") && (i.last().val() == "")) {
                        remove();
                        i = $("#ConfigMyList .inputBox input.inputId");
                    }
                }
                // キャンセルボタン
                box.append(common.createButton("Cancel", "cancel").on("click", function () {
                    $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                }));
                // クリアボタン
                box.append(common.createButton("Clear", "clear").on("click", function () {
                    $("#ConfigMyList .inputBox input.inputId").val("");
                    $("#ConfigMyList .inputBox .dispName").text("");
                    checkInput();
                }));
                // 保存ボタン
                box.append(common.createButton("Save", "save").on("click", function () {
                    var a = [];
                    $("#ConfigMyList .inputBox input.inputId").each(function (i, s) {
                        a.push($(s).val());
                    });
                    if (a[a.length - 1] == "") {
                        a.pop();
                    }
                    self._save(a);
                    $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                }));
                // 現在表示コピーボタン
                box.append(common.createButton("現在のリストをデフォルトに追加する", "copy").on("click", function () {
                    box.find(".inputLine").last().remove();
                    $("#ListPanel li .block-b .block-b-1").each(function () {
                        add($(this).text());
                    });
                    checkInput();
                }));

                var f = function () {
                    var t = $(this);
                    self._searchId(t, t.parent().next());
                    checkInput();
                }

                box.on("change keyup", "input", f);
                this._init = true;

                // 初期化メソッド
                this._openIni = function () {
                    box.find(".inputLine").remove();
                    // 初期要素の追加
                    if (Manager.option.myList.length > 0) {
                        Manager.option.myList.forEach(function (s, i) {
                            add(s);
                        });
                    }
                    checkInput();
                }
            },

            _openIni: null,

            open: function () {
                if (!this._init) {
                    this._create();
                }
                // 初期化
                this._openIni();
                // オープン
                $("[data-panelType=mainContents]").exHide();
                $("#ConfigMyList").exShow();
                // マネージャーに登録
                Manager.startEdit();
            },

            _save: function (myList) {
                $.cookie("myList", myList.join("\n"), { expires: 365 });
                Manager.option.myList = myList;
                Search.resetSection();
            }
        },

        MySection: {
            _init: false,

            _create: function () {
                var self = this;
                var box = $("#ConfigMySection .buttonBox");
                // キャンセルボタン
                box.append(common.createButton("Cancel", "cancel").on("click", function () {
                    $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                }));
                // クリアボタン
                box.append(common.createButton("Clear", "clear").on("click", function () {
                    $("#ConfigMySection .buttonBox a.button.section").removeClass("on");
                }));
                // 保存ボタン
                box.append(common.createButton("Save", "save").on("click", function () {
                    var a = [];
                    $("#ConfigMySection .buttonBox a.button.section.on").each(function (i, s) {
                        a.push($(s).text());
                    });
                    self._save(a);
                    $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                }));
                // 部署作成
                Manager.SectionList.forEach(function (s, i) {
                    box.append(common.createButton(s[0], "select section", "ui-icon-check"));
                });
                box.on("click", "a.button.section", function () {
                    var t = $(this);
                    if (t.hasClass("on")) {
                        t.removeClass("on");
                    } else {
                        t.addClass("on");
                    }
                });
                this._init = true;
            },

            open: function () {
                if (!this._init) {
                    this._create();
                }
                // 初期化
                $("#ConfigMySection .buttonBox a.button.section").each(function () {
                    var t = $(this).removeClass("on");
                    if ($.inArray(t.text(), Manager.option.mySection) > -1) {
                        t.addClass("on");
                    }
                });
                // オープン
                $("[data-panelType=mainContents]").exHide();
                $("#ConfigMySection").exShow();
                // マネージャーに登録
                Manager.startEdit();
            },

            _save: function (mySection) {
                $.cookie("mySection", mySection.join("\n"), { expires: 365 });
                Manager.option.mySection = mySection;
                Search.resetSection();
            }
        },

        Etc: {
            _init: false,

            _addConfirm: false,
            _addConfirmScr: "EX.b(true);",
            _delConfirmScr: "",

            _addDirectPaste: true,
            _addDirectPasteScr: "",
            _delDirectPasteScr: "EX.c(false);",

            _editMyScr: function () {
                var myScr = "";
                if (this._addConfirm) {
                    $("#ConfigEtc .inputBox a.button.config.confirm.yes").addClass("on");
                    $("#ConfigEtc .inputBox a.button.config.confirm.no").removeClass("on");
                    myScr += this._addConfirmScr;
                } else {
                    // デフォルト
                    $("#ConfigEtc .inputBox a.button.config.confirm.yes").removeClass("on");
                    $("#ConfigEtc .inputBox a.button.config.confirm.no").addClass("on");
                    myScr += this._delConfirmScr;
                }
                if (this._addDirectPaste) {
                    $("#ConfigEtc .inputBox a.button.config.paste.yes").addClass("on");
                    $("#ConfigEtc .inputBox a.button.config.paste.no").removeClass("on");
                    myScr += this._addDirectPasteScr;
                } else {
                    // デフォルト
                    $("#ConfigEtc .inputBox a.button.config.paste.yes").removeClass("on");
                    $("#ConfigEtc .inputBox a.button.config.paste.no").addClass("on");
                    myScr += this._delDirectPasteScr;
                }
                $("#ConfigEtc .inputBox textarea").val(myScr);
            },

            _create: function () {
                var self = this;
                var ta = $("#ConfigEtc .inputBox #ExScript");

                $("#ConfigEtc .inputBox")
                    .append(common.createButton("Cancel", "cancel").on("click", function () {
                        $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                    }))
                    .append(common.createButton("Save", "save").on("click", function () {
                        $.cookie("myScr", ta.val(), { expires: 365 });
                        location.reload();
                    }))
                    .append($("<div></div>").addClass("title").text("更新時の確認メッセージの表示"))
                    .append(common.createButton("表示する", "select config confirm yes", "ui-icon-radio").on("click", function () {
                        self._addConfirm = true;
                        self._editMyScr();
                    }))
                    .append(common.createButton("表示しない", "select config confirm no", "ui-icon-radio").on("click", function () {
                        self._addConfirm = false;
                        self._editMyScr();
                    }))
                    .append($("<div></div>").addClass("title").text("Pasteの動作"))
                    .append(common.createButton("Paste+更新", "select config paste yes", "ui-icon-radio").on("click", function () {
                        self._addDirectPaste = true;
                        self._editMyScr();
                    }))
                    .append(common.createButton("Paste+編集", "select config paste no", "ui-icon-radio").on("click", function () {
                        self._addDirectPaste = false;
                        self._editMyScr();
                    }))
                    .append($(ta));

                this._init = true;
            },

            open: function () {
                if (!this._init) {
                    this._create();
                }
                var myScr = $.cookie("myScr") || "";
                this._addConfirm = (myScr.indexOf(this._addConfirmScr) > -1);
                this._addDirectPaste = (myScr.indexOf(this._addDirectPasteScr) > -1);
                this._editMyScr();
                $("#ConfigEtc .inputBox textarea").val(myScr);

                $("[data-panelType=mainContents]").exHide();
                $("#ConfigEtc").exShow();
                // マネージャーに登録
                Manager.startEdit();
            }
        },

        _isLock: false,
        _openList: function (isLock) {
            if (isLock) {
                this._isLock = isLock;
            }
            $("#SelectConfigList").addClass("open");
        },

        _closeList: function (isForce) {
            if (this._isLock && !isForce) {
                return;
            }
            $("#SelectConfigList").removeClass("open");
            if (this._isLock) {
                this._isLock = false;
            }
        },

        init: function () {
            var self = this;

            $("#SelectConfigList").on("click", "li[data-configType=myList]", function (e) {
                self.MyList.open();
                self._closeList(true);
                return false;
            })
            .on("click", "li[data-configType=mySection]", function (e) {
                self.MySection.open();
                self._closeList(true);
                return false;
            })
            .on("click", "li[data-configType=etc]", function (e) {
                self.Etc.open();
                self._closeList(true);
                return false;
            });
            $("#ConfigMenu").hover(function () {
                self._openList(false);
            }, function () {
                self._closeList(false);
            }).on("click", function () {
                if (self._isLock) {
                    self._closeList(true);
                } else {
                    self._openList(true);
                }
            });
        }
    }

    // ポップアップクラス
    var popup = function (main, type) {
        this._main = main;
        var self = this;

        main.on("click", "a.button.popupSelect", function () {
            self.commit($(this).text());
            return false;
        })
        .on("click", function () {
            self.close();
            return false;
        });
    }
    popup.prototype = {
        _main: null,
        _callBack: null,
        _clear: null,
        open: function (callBack) {
            this._callBack = callBack;
            this._main.exShow();
        },
        close: function () {
            this._main.exHide();
        },
        commit: function (text) {
            this._callBack(text);
            this.close();
        },
        clear: function () {
            if (this._clear) {
                this._clear();
            }
        }
    }

    // マネージャー
    var Manager = {
        List: [],
        List2: [],
        SectionList: [],
        UpdateBackup: {},

        PopupJotai: null,
        PopupYukisaki: null,
        PopupNichiji: null,

        option: {
            myList: [],
            mySection: [],
            exConfirm: false,
            exDirectPaste: true,
            exReselect: []
        },

        _editVal: {
            id: "",
            statusCd: "",
            jotai: "",
            yukisaki: "",
            nichiji: ""
        },
        _canceller: [],
        _stopReload: false,

        startEdit: function (canceller) {
            this.cancelEdit();
            if (canceller) {
                this._canceller.push(canceller);
            }
            this._stopReload = true;
        },
        cancelEdit: function () {
            while (this._canceller.length > 0) {
                this._canceller.pop()();
            }
            this._stopReload = false;
        },
        setAutoReload: function (wsURI) {
            if (!WebSocket) { return; }
            var self = this;
            var ws = new WebSocket(wsURI);
            ws.onmessage = function(event) {
                if (event && event.data) {
                    self.reloadByWebSocket(JSON.parse(event.data));
                } else {
                    console.log("WebSocket: reget no data");
                }
            }
        },
        reloadByWebSocket: function (t) {
            this.List = common.concatList2(t.d, this.List2);
            UpdateTime.refreshTime();
            if (!this._stopReload) {
                ListItem.update();
            }
        },
        reload: function (afterFunc) {
            UpdateTime.waiting();
            this._stopReload = true;
            var self = this;

            Coco.Ajax.getYukisakiList(function (t) {
                self.List = common.concatList2(t.d, self.List2);
                ListItem.update();
                UpdateTime.refreshTime();
                self._stopReload = false;
                if (afterFunc){ afterFunc(); }
            });
        },
        getSection: function (f) {
            this._stopReload = true;
            var self = this;

            Coco.Ajax.getSectionList(function (t) {
                self.SectionList = t.d;
                f();
            });
        },
        _update: function (item) {
            this._stopReload = true;
            var self = this;

            // 更新前状態を保持
            this.UpdateBackup[item.id] = {
                statusCd: item.statusCd,
                jotai: item.jotai,
                yukisaki: item.yukisaki,
                nichiji: item.nichiji
            }

            Coco.Ajax.updateYukisaki(
                {
                    "UserID": this._editVal.id,
                    "StatusCD": this._editVal.statusCd,
                    "Jotai": this._editVal.jotai,
                    "Yukisaki": this._editVal.yukisaki,
                    "Nichiji": this._editVal.nichiji
                },
                function (t) {
                    self.cancelEdit();
                    self.reload();
                }
            );
        },
        setStatus: function (id, statusCd, jotai, yukisaki, nichiji) {
            this._editVal.id = id;
            this._editVal.statusCd = statusCd;
            this._editVal.jotai = jotai;
            this._editVal.yukisaki = yukisaki;
            this._editVal.nichiji = nichiji;
        },
        update: function (msg) {
            var id = this._editVal.id;
            var item = this.getListItemById(id);
            if (!item) {
                alert("id:" + id + " not found");
                return;
            }

            msg = msg || item.name + "(" + id + ") を更新しますか？";
            if (!this.option.exConfirm || confirm(msg)) {
                this._update(item);
            }
        },
        updateDirect: function (id, statusCd) {
            this.setStatus(id, statusCd, "", "", "");
            this.update();
        },
        getListItemById: function (id) {
            var t = null;
            return (this.List.some(function (item) {
                if (item.id.toLowerCase() == id.toLowerCase()) {
                    t = item;
                    return true;
                }
            })) ? t : null;
        },
        init: function (afterReload) {
            // ここからページロード処理

            // デフォルト表示の設定
            var r = $.cookie("myList");
            if (r) {
                this.option.myList = r.split("\n");
            }
            // よく使う部署の設定
            var s = $.cookie("mySection");
            if (s) {
                this.option.mySection = s.split("\n");
            }

            // 初期化処理
            UpdateTime.init();
            ListItem.init();
            Config.init();
            Search.init();

            // ポップアップ
            this.PopupJotai = new popup($("#PopupJotaiMain"));
            this.PopupYukisaki = new popup($("#PopupYukisakiMain"));
            this.PopupNichiji = new popup($("#PopupNichijiMain"));

            // adsearchデータ取得
            this.List2 = list;
            // 部署取得
            this.getSection(function () {
                Search.createSection();
                Manager.reload(afterReload);
            });

            // カスタムスクリプト
            eval($.cookie("myScr") || "");
        }
    }

    // オプションスクリプト
    var EX = {
        a: function () {},
        b: function (b) { Manager.option.exConfirm = b; },
        c: function (b) { Manager.option.exDirectPaste = b; }
    }

    Coco.Config = Config;
    Coco.Manager = Manager;
});
