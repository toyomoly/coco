$(function () {
    var common = Coco.Common;
    var Manager = Coco.Manager;

    // コンフィグ拡張
    $.extend(Coco.Config, {
        Jiji: {
            // 該当者検索
            _searchId: function (inputId) {
                var l = $("#ConfigJiji .inputBox .jijiCtrl .idLine");
                var inputId = l.find("input");
                var dispName = l.find(".dispName").text("");
                var btnDown = l.find("a.button.sign-in").exHide();
                var id = inputId.val().toUpperCase();
                var item = Manager.getListItemById(id);
                if (item) {
                    dispName.text(item.name);
                    inputId.val(item.id);
                    btnDown.exShow();
                }
            },

            _id: "",
            _pingon: "0",
            _pingoff: "0",
            _changePingon: function (val) {
                this._pingon = (val == "1") || (val == "2") ? val : "0";
                var l = $("#ConfigJiji .inputBox .jijiCtrl .editLine");
                l.find("a.button.select.pingon").removeClass("on");
                l.find("a.button.select.pingon" + this._pingon).addClass("on");
            },
            _changePingoff: function (val) {
                this._pingoff = (val == "1") ? val : "0";
                var l = $("#ConfigJiji .inputBox .jijiCtrl .editLine");
                l.find("a.button.select.pingoff").removeClass("on");
                l.find("a.button.select.pingoff" + this._pingoff).addClass("on");
            },

            _requestGetJiji: function (id, callback) {
                Coco.Ajax.getJiji(
                    {
                        UserID: id
                    },
                    function (d) {
                        callback(d);
                    }
                );
            },

            _requestSetJiji: function (id, ipAddress, action1, action2) {
                Coco.Ajax.setJiji(
                    {
                        UserID: id,
                        IpAddress: ipAddress,
                        Action1: action1,
                        Action2: action2
                    },
                    function (d) {
                        if (d.Status == 0) {
                            alert("登録しました");
                        } else {
                            alert(d.Message);
                        }
                    }
                );
            },

            _requestCheckPing: function (ipAddress) {
                Coco.Ajax.checkPing(
                    {
                        IpAddress: ipAddress
                    },
                    function (d) {
                        alert(d.Message);
                    }
                );
            },

            _init: false,

            _create: function () {
                var self = this;
                var box = $("#ConfigJiji .inputBox");

                var b = common.createTextBox({
                    val: "",
                    placeholder: "社員番号"
                });
                var inputId = b.find("input").addClass("inputId");
                var dispName = $("<div></div>").addClass("dispName");

                var jijiEditOpen = function (isOpen) {
                    if (isOpen) {
                        box.find(".jijiCtrl").addClass("open");
                        box.find(".jijiCtrl .idLine .edit-id").text(inputId.val());
                    } else {
                        box.find(".jijiCtrl").removeClass("open");
                    }
                }

                box.append(common.createButton("Cancel", "cancel").on("click", function () {
                        $("#SelectSectionList li:not(.hidden)").first().trigger("click");
                    }))
                    .append(common.createButton("使い方を見る", "howto").on("click", function () {
                        window.open("kiki-jiji/howto.html", "kikijiji");
                    }))
                    .append($("<div></div>").addClass("jijiCtrl")
                        .append($("<div></div>").addClass("idLine")
                            .append(b)
                            .append($("<div></div>").addClass("edit-id"))
                            .append(dispName)
                            .append(common.createButton("確認", "sign-in", "ui-icon-carat-d").exHide().on("click", function () {
                                var id = inputId.val();
                                self._id = id;
                                $.cookie("myId", id, { expires: 365 })
                                self._requestGetJiji(id, function (d) {
                                    box.find(".jijiCtrl .editLine .editLine-inner input").val(d.IpAddress).change();
                                    self._changePingon(d.Action1);
                                    self._changePingoff(d.Action2);
                                    box.find(".jijiCtrl .editLine .jijilog").html((d.Log.length > 0) ? "最近の履歴<br />" + d.Log.join("<br />") : "");
                                    jijiEditOpen(true);
                                });
                            }))
                            .append(common.createButton("", "sign-out mini", "ui-icon-carat-u").on("click", function () {
                                jijiEditOpen(false);
                            }))
                        )
                        .append($("<div></div>").addClass("editLine")
                            .append($("<div></div>").addClass("editLine-inner")
                                .append(common.createTextBox({
                                    val: "",
                                    placeholder: "ホスト名（またはIPアドレス）"
                                }))
                                .append(common.createButton("ping確認", "ping").on("click", function () {
                                    var ipAddress = box.find(".jijiCtrl .editLine .editLine-inner input").val();
                                    self._requestCheckPing(ipAddress);
                                }))
                            )
                            .append($("<div></div>").addClass("title").text("端末を起動したとき"))
                            .append(common.createButton("変更しない", "select pingon pingon0", "ui-icon-radio").on("click", function () {
                                self._changePingon("0");
                            }))
                            .append(common.createButton("帰宅 → 社内 にする", "select pingon pingon1", "ui-icon-radio").on("click", function () {
                                self._changePingon("1");
                            }))
                            .append(common.createButton("社外・休暇・帰宅 → 社内 にする", "select pingon pingon2", "ui-icon-radio").on("click", function () {
                                self._changePingon("2");
                            }))
                            .append($("<div></div>").addClass("title").text("端末をシャットダウンしたとき"))
                            .append(common.createButton("変更しない", "select pingoff pingoff0", "ui-icon-radio").on("click", function () {
                                self._changePingoff("0");
                            }))
                            .append(common.createButton("社内 → 帰宅 にする", "select pingoff pingoff1", "ui-icon-radio").on("click", function () {
                                self._changePingoff("1");
                            }))
                            .append(common.createButton("この内容で登録する", "jijiSave").on("click", function () {
                                // 保険
                                if (!box.find(".jijiCtrl").hasClass("open")) { return; }
                                // 更新
                                self._requestSetJiji(
                                    self._id,
                                    box.find(".jijiCtrl .editLine .editLine-inner input").val(),
                                    self._pingon,
                                    self._pingoff
                                );
                            }))
                            .append($("<div></div>").addClass("jijilog"))
                        )
                    )
                    .on("change keyup", ".idLine input", function () {
                        self._searchId();
                    });

                this._init = true;
            },

            open: function () {
                if (!this._init) {
                    this._create();
                }
                $("#ConfigJiji .inputBox .jijiCtrl .idLine input").val($.cookie("myId") || "").change();
                // オープン
                $("[data-panelType=mainContents]").exHide();
                $("#ConfigJiji").exShow();
                // マネージャーに登録
                Manager.startEdit();
            }
        },

        // 追加init
        exInit: function () {
            var self = this;

            $("#SelectConfigList").addClass("extend")
            .on("click", "li[data-configType=jiji]", function (e) {
                self.Jiji.open();
                self._closeList(true);
                return false;
            });
        }
    });

    Coco.Config.exInit();
});
