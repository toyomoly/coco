$(function () {
    // ライブラリ
    var common = Coco.Common;

    // リストアイテム
    var ListItem = {
        _add: function (item) {
            var li = $("<li></li>").addClass("theme" + item.statusCd).attr("data-id", item.id)
            .append($("<div></div>").addClass("block-a")
                .append($("<div></div>").addClass("block-a-1").append(item.imgTag))
            )
            .append($("<div></div>").addClass("block-b")
                .append($("<div></div>").addClass("block-b-1")
                    .append($("<div></div>").addClass("textdata textdata-id").append(item.id))
                    .append($("<div></div>").addClass("textdata textdata-group").append(item.section))
                )
                .append($("<div></div>").addClass("block-b-2 textdata large").append(item.name))
                .append($("<div></div>").addClass("block-b-3")
                    .append($("<div></div>").addClass("block-view")
                        .append(common.createButton(
                            item.statusCd == "1" ? Coco.Text.StatusList[0] :
                            item.statusCd == "2" ? Coco.Text.StatusList[1] :
                            item.statusCd == "3" ? Coco.Text.StatusList[2] : Coco.Text.StatusList[3],
                            "status"
                        ))
                        .append($("<div></div>").addClass("textdata textdata-comment").append(item.comment))
                    )
                )
            )
            .append($("<div></div>").addClass("block-c ui-icon-carat-r button-icon")
            );

            return li;
        },

        _edit: function (id) {
            // ここのアイテム選択が課題（複数所属の人は？）
            var item = Manager.getListItemById(id);
            if (!item) {
                return;
            }

            // マネージャーに登録
            Manager.startEdit(function () {
                $("#BasePanel").removeClass("edit");
            });

            $("#BasePanel").addClass("edit");

            $("#EditPanel").attr("data-id", item.id);
            $("#EditSelectStatus").val(item.statusCd);
            $("#EditTextComment").val(item.comment);
        },

        _createSelectStatus: function (defaultValue) {
            var sel = $("<select></select>").addClass("selectStatus");
            Coco.Text.StatusList.forEach(function (s, i) {
                sel.append($("<option></option>").text(s).val("" + (i + 1)));
            });
            sel.val(defaultValue);
            return sel;
        },

        _detail: function (id) {
            // ここのアイテム選択が課題（複数所属の人は？）
            var item = Manager.getListItemById(id);
            if (!item) {
                return;
            }

            // マネージャーに登録
            //Manager.startEdit(function () {
            //    $("#BasePanel").removeClass("detail");
            //});

            $("#BasePanel").addClass("detail");
            var liBase = $("#DetailBaseLi").attr("data-id", item.id);

            liBase.find(".block-a .block-a-1").empty().append(item.imgTag);
            liBase.find(".textdata.data-id").text(item.id);
            liBase.find(".textdata.data-name").text(item.name);
            liBase.find(".textdata.data-kana").text(item.kana);
            liBase.find(".textdata.data-section").text(item.section);
            // liBase.find(".textdata.data-sectionCd").text(item.sectionCd);
            liBase.find(".textdata.data-rank").text(item.rank);
            liBase.find(".textdata.data-phone").empty().append(item.phone);
            if (TheSekiList[id.toLowerCase()] ) {
                liBase.find(".block-line.data-section").addClass("ui-icon-action button-icon");
            } else {
                liBase.find(".block-line.data-section").removeClass("ui-icon-action button-icon");
            }

            var liEdit = $("#DetailEditLi").removeClass().addClass("theme" + item.statusCd).attr("data-id", item.id);
            liEdit.find(".block-c .block-view a.button.status").text(
                item.statusCd == "1" ? Coco.Text.StatusList[0] :
                item.statusCd == "2" ? Coco.Text.StatusList[1] :
                item.statusCd == "3" ? Coco.Text.StatusList[2] : Coco.Text.StatusList[3]
            );
            liEdit.find(".block-c .block-view .data-comment").text(item.comment);

            liEdit.find(".data-lastUpdate").text(item.lastUpdate);
        },

        init: function () {
            var self = this;

            // 追加表示
            $("#ListPanel").on("tap", ".more", function () {
                self._appendListDom();
                // イベントストップ
                return false;
            })
            // リストから詳細表示
            .on("tap", "li", function () {
                var id = $(this).closest("li").attr("data-id");
                self._detail(id);
                // イベントストップ
                return false;
            });

            // 下までスクロールしたら追加表示
            var TopMenu = $("#TopMenu");
            var ListPanel = $("#ListPanel");
            var MainPanel = $("#MainPanel");
            MainPanel.on("scroll", function () {
                var scrollHeight = TopMenu.height() + ListPanel.height();
                var scrollPosition = MainPanel.height() + MainPanel.scrollTop();
                if (scrollHeight - scrollPosition < 50) {
                    //スクロールが下から50px以内に来た場合
                    self._appendListDom(5);
                }
            });

            // 詳細からリストに戻る
            $("#DetailTopMenu").on("tap", function () {
                Manager.cancelEdit();
                $("#BasePanel").removeClass("detail");
                // イベントストップ
                return false;
            });
            // 詳細からの編集
            $(document).on("tap", "#DetailEditLi", function () {
                if ($("#BasePanel").hasClass("edit")) {
                    Manager.cancelEdit();
                } else {
                    var id = $(this).closest("li").attr("data-id");
                    self._edit(id);
                }
                // イベントストップ
                return false;
            });

            // 編集中のキャンセルボタン
            $(document).on("tap", "#BasePanel.edit #MainPanel, #BasePanel.edit #SidePanel", function () {
                Manager.cancelEdit();
                // イベントストップ
                return false;
            });

            // 編集中の編集ボタン
            $("#EditSubmitButton").on("tap", function () {
                var id = $("#EditPanel").attr("data-id");
                var newStatusCd = $("#EditSelectStatus").val();
                var comment = $("#EditTextComment").val();
                Manager.setStatus(id, newStatusCd, comment);
                Manager.update();
                // イベントストップ
                return false;
            });

            // 編集パネル
            var sel = $("#EditSelectStatus");
            Coco.Text.StatusList.forEach(function (s, i) {
                sel.append($("<option></option>").text(s).val("" + (i + 1)));
            });
            $("#EditTextComment").attr("placeholder", Coco.Text.ListEdit.CommentPlaceholder);
            // 詳細画面
            var li = $("#DetailListPanel li");
            li.find(".texttitle.data-id").text(Coco.Text.List.Id);
            li.find(".texttitle.data-name").text(Coco.Text.List.Name);
            li.find(".texttitle.data-kana").text(Coco.Text.List.Kana);
            li.find(".texttitle.data-section").text(Coco.Text.List.Group);
            // li.find(".texttitle.data-sectionCd").text(Coco.Text.List.GroupCd);
            li.find(".texttitle.data-rank").text(Coco.Text.List.Rank);
            li.find(".texttitle.data-phone").text(Coco.Text.List.Phone);
            // li.find(".texttitle.data-theseki").text(Coco.Text.TheSeki.Title);

            // 座席表示
            li.on("tap", ".block-line.data-section.ui-icon-action", function () {
                var id = $(this).closest("li").attr("data-id").toLowerCase();
                window.open("./mapmini?id=" + id, "minimap");
            });
        },

        _sortKey: "",
        _sortAsc: true,
        _sortKeyBk: "",
        _sortAscBk: true,
        setSort: function (key, asc) {
            this._sortKey = key;
            this._sortAsc = asc;
            this._sortKeyBk = key;
            this._sortAscBk = asc;
            this.Reselect();
        },
        setTempSort: function (key, asc) {
            this._sortKey = key;
            this._sortAsc = asc;
            // this.Reselect();
        },
        resetTempSort: function () {
            this._sortKey = this._sortKeyBk;
            this._sortAsc = this._sortAscBk;
            // this.Reselect();
        },

        Reselect: function (selectFunc) {
            if (selectFunc) {
                this._selectFunc = selectFunc;
            } else {
                selectFunc = this._selectFunc;
            }

            var isDetail = $("#BasePanel").hasClass("detail");
            // 編集キャンセル
            Manager.cancelEdit();

            // リスト選択
            var selected = [];
            this._selectedList = Manager.List.filter(function (item, i) {
                if ($.inArray(item.id, selected) > -1) { return false; }
                if (selectFunc(item)) {
                    selected.push(item.id);
                    return true;
                } else {
                    return false;
                }
            });

            // ソート
            if (this._sortKey) {
                var key = this._sortKey;
                var asc = (this._sortAsc) ? 1 : -1;
                this._selectedList.sort(function (a, b) {
                    if (a[key] < b[key]) { return -1 * asc; }
                    if (a[key] > b[key]) { return 1 * asc; }
                    return 0;
                });
            }

            // 件数表示
            $("#ListCount").text(this._selectedList.length + "件");
            // リストの初期化
            this._empty();
            // リストに要素追加
            this._appendListDom();

            // Detailの表示
            if (isDetail) {
                var id = $("#DetailListPanel li").attr("data-id");
                this._detail(id);
            }

            // パネルの表示
            $("[data-panelType=mainContents]").exHide();
            $("#ListPanel").exShow();
        },

        _selectFunc: function () { return []; },
        _selectedList: [],
        _appendListDom: function (max) {
            max = max || 20;
            var m = $("#ListPanel .more");
            for (var i = 0; i < max; i++) {
                if (this._selectedList.length > 0) {
                    var s = this._selectedList.shift();
                    m.before(this._add(s));
                }
            }
            if (this._selectedList.length == 0) {
                m.exHide();
            } else {
                m.exShow();
            }
        },
        _empty: function () {
            $("#ListPanel li").remove();
        }
    }

    // 更新時刻
    var UpdateTime = {
        init: function () {
            $("#LastUpdate").on("tap", function () {
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
        createGroup: function () {
            var self = this;
            var sel = $("#SelectGroupList");
            Manager.SectionList.forEach(function (s, i) {
                sel.append($("<option></option>").text(s[0]).val(s[1]));
            });
            sel.on("change", function (e) {
                self._selectGroup();
            });
            // 初回セレクト
            this._selectGroup();
        },

        _selectGroup: function () {
            var v = $("#SelectGroupList").find("option:selected").val();
            ListItem.Reselect(function (item) {
                return (item.section == v);
            });
        },

        _selectInitial: function () {
            var a = $("#SelectInitialList").find("option:selected").val();
            var ex = new RegExp("^[" + a + "]");
            ListItem.Reselect(function (item) {
                return item.kana.match(ex);
            });
        },

        init: function () {
            var self = this;
            // 検索ボタン
            $("#SearchIcon").on("tap", function () {
                $("#TopMenu").toggleClass("search");
                // イベントストップ
                return false;
            });

            // ふりがなセレクトボックス
            var selInitial = $("#SelectInitialList");
            Coco.Text.Search.InitialList.forEach(function (s, i) {
                selInitial.append($("<option></option>").text(s[0]).val(s.join()));
            });
            selInitial.on("change", function (e) {
                self._selectInitial();
            });

            // ソートセレクトボックス
            var sortKey = "";
            var sort = $("#SelectSortList");
            sort.append($("<option></option>").text(Coco.Text.Sort.Default).val(""))
            .append($("<option></option>").text(Coco.Text.Sort.Kana).val("kana"))
            .append($("<option></option>").text(Coco.Text.Sort.Id).val("id"))
            .on("change", function (e) {
                sortKey = sort.find("option:selected").val();
                ListItem.setSort(sortKey, true);
            });

            // 検索メニュー
            var changeMenu = function (className) {
                $("#TopMenu").removeClass("search");
                $("#TopMenuSub").removeClass("search-group")
                                .removeClass("search-initial")
                                .removeClass("search-keyword")
                                .addClass(className);
            }
            // 選択して探す
            $("#SearchSelectTitle").text(Coco.Text.Search.SelectTitle);
            $("#SearchSelectItem-Group").text(Coco.Text.Search.SelectGroup).on("tap", function () {
                changeMenu("search-group");
                // ソートキーリセット
                ListItem.resetTempSort();
                // グループ検索
                self._selectGroup();
                // イベントストップ
                return false;
            });
            $("#SearchSelectItem-Initial").text(Coco.Text.Search.SelectInitial).on("tap", function () {
                changeMenu("search-initial");
                // 強制かなソート
                ListItem.setTempSort("kana", true);
                // ふりがな検索
                self._selectInitial();
                // イベントストップ
                return false;
            });
            // 検索して探す
            var searchKeyword = function () {
                changeMenu("search-keyword");
                // ソートキーリセット
                ListItem.resetTempSort();
                // キーワード検索
                self._search();
                // キーワード表示
                $("#SearchKeyword").text(Coco.Text.Search.KeywordResultPrefix + $("#SearchKeywordTextBox").val() + Coco.Text.Search.KeywordResultSuffix);
                // イベントストップ
                return false;
            }
            $("#SearchKeywordTitle").text(Coco.Text.Search.KeywordTitle);
            $("#SearchKeywordTextBox").attr("placeholder", Coco.Text.Search.Placeholder).on("keydown", function (e) {
                if (e.keyCode === 13) {
                    searchKeyword();
                }
            });
            $("#SearchKeywordSerchButton").on("tap", searchKeyword);

            // 初期表示
            $("#TopMenuSub").addClass("search-group");
        },
        setKeyword: function (v, exec) {
            $("#SearchKeyword").val(v).change();
            if (exec) {
                this._search();
            }
        },
        _search: function () {
            var newKeyword = $("#SearchKeywordTextBox").val().toLowerCase().replace("　", " ");
            var v = newKeyword.split(" ");
            ListItem.Reselect(function (item) {
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

    // マネージャー
    var Manager = {
        List: [],
        List2: [],
        SectionList: [],
        UpdateBackup: {},

        option: {
            myList: [],
        },

        _editVal: {
            id: "",
            statusCd: "",
            comment: ""
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
        setAutoReload: function (interval) {
            var self = this;
            setInterval(function () {
                if (self._stopReload == false) {
                    self.reload();
                }
            }, interval);
        },
        reload: function (afterFunc) {
            UpdateTime.waiting();
            this._stopReload = true;
            var self = this;

            Coco.Ajax.getYukisakiList(function (t) {
                self.List = common.concatList2(t.d, self.List2);
                ListItem.Reselect();
                UpdateTime.refreshTime();
                self._stopReload = false;
                if (afterFunc) { afterFunc(); }
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
                    "Jotai": this._editVal.comment,
                    "Yukisaki": "",
                    "Nichiji": ""
                },
                function (t) {
                    self.reload();
                }
            );
        },
        setStatus: function (id, statusCd, comment) {
            this._editVal.id = id;
            this._editVal.statusCd = statusCd;
            this._editVal.comment = comment;
        },
        update: function (msg) {
            var id = this._editVal.id;
            var item = this.getListItemById(id);
            if (!item) {
                alert("id:" + id + " not found");
                return;
            }

            this._update(item);
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

            // 初期化処理
            UpdateTime.init();
            ListItem.init();
            //Config.init();
            Search.init();

            // adsearchデータ取得
            this.List2 = list;
            // 部署取得
            this.getSection(function () {
                Search.createGroup();
                Manager.reload();
            });
        }
    }

    //Coco.Config = Config;
    Coco.Manager = Manager;
});
