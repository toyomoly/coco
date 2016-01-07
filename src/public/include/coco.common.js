$.fn.extend({
    exHide: function () {
        return this.addClass("hidden");
    },
    exShow: function () {
        return this.removeClass("hidden");
    }
});

window.Coco = window.Coco || {};

window.Coco.Common = $.extend(navigator.userAgent.match(/(?:iPhone|iPod|Android)/) ? {
    /*
        スマホ用メソッド
    */
    isSmartphone: function () {
        return true;
    },
    isTouch: function () {
        return true;
    },
    _repraceTel: function (p) {
        if ($.isArray(p)) {
            return p.map(function (s) { return "<a href='tel:" + s + "'>" + s + "</a>";}).join(", ");
        } else {
            return "<a href='tel:" + p + "'>" + p + "</a>";
        }
    }
} : {
    /*
        PC用メソッド
    */
    isSmartphone: function () {
        return false;
    },
    isTouch: function () {
        return ("createTouch" in document) || ("ontouchstart" in document);
    },
    _repraceTel: function (p) {
        if ($.isArray(p)) {
            return p.join(", ");
        } else {
            return p;
        }
    }
}, {
    /*
        共通メソッド
    */
    concatList2: function (list1, list2) {
        var self = this;
        return list1.map(function (s, i) {
            var id = s[0].toLowerCase();
            // map と each で受け取る引数違う
            var s2 = ["", "", "", "", "", "", "", "", ""];
            var sortIdx = list2.length;
            $.each(list2, function (j, t) {
                if (id == (t[7] + "nnnnn").substr(0, 5).toLowerCase()) {
                    s2 = t;
                    sortIdx = j;
                    return false;
                }
            });
            var a = s.concat(s2);

            // 内線表示
            a[11] = (s2[3] == "") ? "" : "<div class='small'>(内線)</div>&nbsp;" + self._repraceTel(s2[3]);

            return self._getProperty(a, sortIdx);
        }).sort(function (a, b) {
            return a.sortIndex - b.sortIndex;
        });
    },
    _getProperty: function (itemArray, sortIdx) {
        var statusCd = itemArray[3];
        return {
            // yukisaki
            id: itemArray[0],
            // name: itemArray[1],
            section: itemArray[2],
            statusCd: statusCd,
            status: statusCd == "1" ? Coco.Text.StatusList[0] :
                    statusCd == "2" ? Coco.Text.StatusList[1] :
                    statusCd == "3" ? Coco.Text.StatusList[2] : Coco.Text.StatusList[3],
            jotai: itemArray[4],
            yukisaki: itemArray[5],
            nichiji: itemArray[6],
            comment: this._getComment(itemArray[4], itemArray[5], itemArray[6]),
            lastUpdate: itemArray[7],
            // dolphin
            getImgElement: function () {
                var img = $(itemArray[8] || ("<img src='http://dolphin2.ndensan.co.jp/OTHER/img/" + itemArray[0].substr(1, 4) + ".jpg' />"));
                // 画像読み込みエラー時にダミー表示
                img.error(function () {
                    $(this).before("<div class='no-image ui-icon-user'></div>").remove();
                });
                return img;
            },
            name: itemArray[9] || itemArray[1],
            kana: itemArray[10],
            phone: itemArray[11],
            vSection: itemArray[12],
            sectionCd: itemArray[13],
            rank: itemArray[14],
            // mail: itemArray[15],
            romaji: itemArray[16],
            sortIndex: sortIdx
        }
    },
    _getComment: function (jotai, yukisaki, nichiji) {
        var s = jotai;
        if (yukisaki) s = s ? (s + "　" + yukisaki) : yukisaki;
        if (nichiji) s = s ? (s + "　" + nichiji) : nichiji;
        return s;
    },
    createButton: function (text, className, icon) {
        return $("<a></a>").addClass("button").addClass(className || "").addClass(icon || "").append(text);
    },
    createTextBox: function (option) {
        var id = option.id,
            val = option.val,
            placeholderText = option.placeholder;

        var box = $("<div></div>").addClass("exInputBox");
        var input = $("<input />").addClass("editInput")
        .on("click", function () {
            this.select();
        })
        .on("change", function () {
            if (input.val().length > 0) {
                btn.exShow();
                if (myPlaceholder) myPlaceholder.exHide();
            } else {
                btn.exHide();
                if (myPlaceholder) myPlaceholder.exShow();
            }
        })
        .on("keyup", function () {
            if (input.val().length > 0) btn.exShow();
            else btn.exHide();
        })
        .on("focus", function () {
            if (myPlaceholder) myPlaceholder.exHide();
        })
        .on("blur", function () {
            if (input.val().length < 1 && myPlaceholder) myPlaceholder.exShow();
        });
        if (id) {
            input.attr("id", id);
        }
        if (val) {
            input.val(val);
        }
        var btn = $("<div></div>").addClass("delval ui-icon-delete").on("click", function () {
            input.val("").change();
            btn.exHide();
            input.focus();
        });
        box.append(input).append(btn);

        var myPlaceholder = null;
        if (placeholderText) {
            input.attr("placeholder", placeholderText);

            if (!("placeholder" in document.createElement("input"))) {
                myPlaceholder = $("<div></div>").addClass("placeholderText").text(placeholderText).on("click", function () {
                    input.click();
                });
                box.append(myPlaceholder);
            }
        }

        if (input.val().length > 0) {
            btn.exShow();
            if (myPlaceholder) myPlaceholder.exHide();
        } else {
            btn.exHide();
            if (myPlaceholder) myPlaceholder.exShow();
        }
        return box;
    },
    getTime: function () {
        var d = new Date();
        // 年月日・曜日・時分秒の取得
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();

        // 1桁を2桁に変換する
        if (month < 10) { month = "0" + month; }
        if (day < 10) { day = "0" + day; }
        if (hour < 10) { hour = "0" + hour; }
        if (minute < 10) { minute = "0" + minute; }
        if (second < 10) { second = "0" + second; }

        return d.getFullYear() + "/" + month + "/" + day + "　" + hour + ":" + minute + ":" + second;
    }
});

window.Coco.Ajax = {
    _argumentError: function () {
        console.log("argumentError");
    },
    _ajaxError: function (jqXHR, textStatus, errorThrown) {
        console.log("textStatus: " + textStatus + ", errorThrown: " + errorThrown);
    },
    getYukisakiList: function (callback) {
        $.ajax({
            type: "POST",
            url: "../post/getYukisakiList",
            success: callback,
            error: this._ajaxError
        });
    },
    getSectionList: function (callback) {
        $.ajax({
            type: "POST",
            url: "../post/getSectionList",
            success: callback,
            error: this._ajaxError
        });
    },
    updateYukisaki: function (data, callback) {
        if (data == null || data.UserID == null
                         || data.StatusCD == null
                         || data.Jotai == null
                         || data.Yukisaki == null
                         || data.Nichiji == null) {
            this._argumentError();
            return;
        }
        $.ajax({
            type: "POST",
            url: "../post/updateYukisaki",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: callback,
            error: this._ajaxError
        });
    },
    getJiji: function (data, callback) {
        if (data == null || data.UserID == null) {
            this._argumentError();
            return;
        }
        $.ajax({
            type: "POST",
            url: "../post/getJiji",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: callback,
            error: this._ajaxError
        });
    },
    setJiji: function (data, callback) {
        if (data == null || data.UserID == null
                         || data.IpAddress == null
                         || data.Action1 == null
                         || data.Action2 == null) {
            this._argumentError();
            return;
        }
        $.ajax({
            type: "POST",
            url: "../post/setJiji",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: callback,
            error: this._ajaxError
        });
    },
    checkPing: function (data, callback) {
        if (data == null || data.IpAddress == null) {
            this._argumentError();
            return;
        }
        $.ajax({
            type: "POST",
            url: "../post/checkPing",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: callback,
            error: this._ajaxError
        });
    }
}
