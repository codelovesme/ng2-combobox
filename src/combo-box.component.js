"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Rx_1 = require("rxjs/Rx");
var forms_1 = require("@angular/forms");
var ComboBoxComponent = ComboBoxComponent_1 = (function () {
    function ComboBoxComponent() {
        this.remote = false;
        this.clearOnSelect = false;
        this.forceSelection = true;
        this.localFilter = false;
        this.typeAheadDelay = 500;
        this.inputClass = 'form-control';
        this.loadingIconClass = 'loader';
        this.triggerIconClass = 'trigger';
        this.dataRoot = '';
        this.disabledField = null;
        this.onQuery = new core_1.EventEmitter();
        this.onSelect = new core_1.EventEmitter();
        this.onCreate = new core_1.EventEmitter();
        this.onBlur = new core_1.EventEmitter();
        this.onInitValue = new core_1.EventEmitter();
        this.loading = false;
        this.hideList = true;
        this._marked = null;
        this._hasFocus = false;
        // ControlValueAccessor props
        this.propagateTouch = function () {
        };
        this.propagateChange = function (_) {
        };
    }
    ComboBoxComponent.prototype.ngOnInit = function () {
    };
    Object.defineProperty(ComboBoxComponent.prototype, "listData", {
        set: function (value) {
            var _this = this;
            if (this._listDataSubscription) {
                this._listDataSubscription.unsubscribe();
            }
            if (value instanceof Rx_1.Observable) {
                var listData = value;
                this._listDataSubscription = listData.subscribe(function (data) {
                    // todo: make dataRoot work for all depths
                    if (_this.dataRoot) {
                        data = data[_this.dataRoot];
                    }
                    _this.data = _this._initialData = data;
                    _this.loading = false;
                    if (0 === _this._tmpVal || _this._tmpVal) {
                        _this.writeValue(_this._tmpVal);
                    }
                });
            }
            else {
                var data = value;
                this.data = this._initialData = data;
                this.loading = false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComboBoxComponent.prototype, "currVal", {
        get: function () {
            return this._currVal;
        },
        set: function (value) {
            this._currVal = value;
            this._tmpVal = null;
            this.marked = null;
            if (this._hasFocus) {
                this.hideList = false;
            }
            clearTimeout(this._aheadTimer);
            if (!this._currVal) {
                this.sendModelChange(null);
                if (!this.remote && this.localFilter) {
                    this.data = this._initialData;
                }
                return;
            }
            this._aheadTimer = setTimeout(this.loadData.bind(this), this.typeAheadDelay);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComboBoxComponent.prototype, "marked", {
        get: function () {
            return this._marked;
        },
        // todo: scroll marked into view
        set: function (value) {
            if (null === value) {
                this._marked = value;
            }
            else if (this.data && 0 <= value && this.data.length >= value - 1) {
                this._marked = value;
                // use private var to prevent query trigger
                this._currVal = this.getDisplayValue(this.data[this._marked]);
            }
        },
        enumerable: true,
        configurable: true
    });
    ComboBoxComponent.prototype.onKeyDown = function (event) {
        var code = event.which || event.keyCode;
        switch (code) {
            case 13:
                event.preventDefault();
                this.handleEnter();
                break;
            case 38:
                this.handleUp();
                break;
            case 40:
                this.handleDown();
                break;
        }
    };
    ComboBoxComponent.prototype.onItemClick = function (index, item) {
        if (this.isDisabled(item)) {
            return;
        }
        this.marked = index;
        this.onSelect.emit(this.data[this.marked]);
        this.sendModelChange(this.data[this.marked]);
        if (this.clearOnSelect) {
            this.clear();
        }
        else {
            this.hideList = true;
        }
        if (!this.remote && !this.localFilter) {
            this.data = this._initialData;
        }
    };
    ComboBoxComponent.prototype.onFieldBlur = function (event) {
        var _this = this;
        this._hasFocus = false;
        this.onBlur.emit(event);
        // timeout for hide to catch click event on list :-(
        setTimeout(function () {
            _this.hideList = true;
            if (!_this.remote && !_this.localFilter) {
                _this.data = _this._initialData;
            }
        }, 200);
        this.propagateTouch();
    };
    ComboBoxComponent.prototype.onFieldFocus = function () {
        this._hasFocus = true;
        this.hideList = false;
        this.loadData();
    };
    ComboBoxComponent.prototype.isMarked = function (value) {
        if (null === this.marked) {
            return false;
        }
        return this.data[this.marked] === value;
    };
    ComboBoxComponent.prototype.isDisabled = function (value) {
        if (!this.disabledField) {
            return false;
        }
        return !!value[this.disabledField];
    };
    ComboBoxComponent.prototype.handleEnter = function () {
        if (!this.loading) {
            if (null === this.marked) {
                if (this.forceSelection) {
                    this.marked = null;
                    for (var i = 0; i < this.data.length; i++) {
                        if (!this.isDisabled(this.data[i])) {
                            this.marked = i;
                            break;
                        }
                    }
                    if (this.marked) {
                        this.onSelect.emit(this.data[this.marked]);
                        this.sendModelChange(this.data[this.marked]);
                    }
                }
                else {
                    this.onCreate.emit(this.currVal);
                }
            }
            else {
                var item = this.data[this.marked];
                if (this.isDisabled(item)) {
                    return;
                }
                this.onSelect.emit(this.data[this.marked]);
                this.sendModelChange(this.data[this.marked]);
            }
            if (this.clearOnSelect) {
                this.clear();
            }
            else {
                this.hideList = true;
            }
            if (!this.remote && !this.localFilter) {
                this.data = this._initialData;
            }
        }
    };
    ComboBoxComponent.prototype.handleUp = function () {
        if (this.marked) {
            this.marked--;
        }
    };
    ComboBoxComponent.prototype.handleDown = function () {
        if (null !== this.marked) {
            this.marked++;
        }
        else {
            this.marked = 0;
        }
    };
    ComboBoxComponent.prototype.clear = function () {
        this.currVal = '';
        this.data = [];
    };
    ComboBoxComponent.prototype.getDisplayValue = function (val) {
        var result = val;
        if (!this.displayField || !val) {
            return null;
        }
        this.displayField.split('.').forEach(function (index) {
            result = result[index];
        });
        return result;
    };
    ComboBoxComponent.prototype.getValueValue = function (val) {
        var result = val;
        if (!this.valueField || !val) {
            return val;
        }
        this.valueField.split('.').forEach(function (index) {
            result = result[index];
        });
        return result;
    };
    ComboBoxComponent.prototype.loadData = function () {
        var _this = this;
        if (!this.remote) {
            if (this.localFilter) {
                this.data = this._initialData.filter(function (item) {
                    return !_this.currVal ||
                        -1 !== _this.getDisplayValue(item).indexOf(_this.currVal);
                });
            }
        }
        else {
            this.loading = true;
            this.onQuery.emit(this._currVal);
        }
    };
    ComboBoxComponent.prototype.sendModelChange = function (val) {
        this.propagateChange(this.getValueValue(val));
    };
    ComboBoxComponent.prototype.searchValueObject = function (value) {
        var _this = this;
        if (false === value instanceof Object && this.valueField && this._initialData) {
            this._initialData.forEach(function (item) {
                if (value === _this.getValueValue(item)) {
                    value = item;
                }
            });
        }
        return value;
    };
    ComboBoxComponent.prototype.writeValue = function (value) {
        value = this.searchValueObject(value);
        if (value instanceof Object && this.getDisplayValue(value)) {
            this.currVal = this.getDisplayValue(value);
        }
        else {
            this._tmpVal = value;
        }
        this.onInitValue.emit(value);
    };
    ComboBoxComponent.prototype.registerOnChange = function (fn) {
        this.propagateChange = fn;
    };
    ComboBoxComponent.prototype.registerOnTouched = function (fn) {
        this.propagateTouch = fn;
    };
    return ComboBoxComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "displayField", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "valueField", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], ComboBoxComponent.prototype, "remote", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], ComboBoxComponent.prototype, "clearOnSelect", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], ComboBoxComponent.prototype, "forceSelection", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], ComboBoxComponent.prototype, "localFilter", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], ComboBoxComponent.prototype, "typeAheadDelay", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "inputClass", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "loadingIconClass", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "triggerIconClass", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "dataRoot", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ComboBoxComponent.prototype, "disabledField", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBoxComponent.prototype, "onQuery", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBoxComponent.prototype, "onSelect", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBoxComponent.prototype, "onCreate", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBoxComponent.prototype, "onBlur", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ComboBoxComponent.prototype, "onInitValue", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], ComboBoxComponent.prototype, "listData", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], ComboBoxComponent.prototype, "currVal", null);
ComboBoxComponent = ComboBoxComponent_1 = __decorate([
    core_1.Component({
        moduleId: 'ng2-combobox',
        selector: 'combo-box',
        template: "\n        <div class=\"field-wrap\">\n            <input class=\"{{inputClass}}\" type=\"text\"\n                   [(ngModel)]=\"currVal\"\n                   (keydown)=\"onKeyDown($event)\"\n                   (blur)=\"onFieldBlur($event)\"\n                   (focus)=\"onFieldFocus()\">\n        \n            <div class=\"icons\">\n                <i *ngIf=\"loading\" class=\"{{loadingIconClass}}\"></i>\n                <i *ngIf=\"!loading\" class=\"{{triggerIconClass}}\"></i>\n            </div>\n        \n            <div class=\"list\" *ngIf=\"data && !hideList\">\n                <div *ngFor=\"let item of data;let index = index;\"\n                     [ngClass]=\"{'item': true, 'marked': isMarked(item), 'disabled': isDisabled(item)}\"\n                     (click)=\"onItemClick(index, item)\">\n                    {{getDisplayValue(item)}}\n                </div>\n            </div>\n        </div>\n    ",
        styles: ["\n        .field-wrap {\n            position: relative;\n        }\n                \n        .list {\n            position: absolute;\n            width: 100%;\n            height: auto;\n            background-color: white;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);\n            z-index: 9999;\n            max-height: 200px;\n            overflow: auto;\n        }\n        \n        .list .item {\n            padding: 10px 20px;\n            cursor: pointer;\n        }\n        \n        .list .item.marked,\n        .list .item:hover{\n            background-color: #ecf0f5;\n        }\n        \n        .list .item.marked {\n            font-weight: bold;\n        }\n        \n        .list .item.disabled {\n            opacity: .5;\n        }\n        \n        .icons {\n            position: absolute;\n            right: 8px;\n            top: 0px;\n            height: 100%;\n        }\n        \n        .icons i {\n            height: 20px;\n            width: 20px;\n            position: absolute;\n            top: 0;\n            bottom: 0;\n            left: 0;\n            right: 0;\n            margin: auto auto auto -20px;\n        }\n        \n        .loader {\n            background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0nMzhweCcgaGVpZ2h0PSczOHB4JyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgY2xhc3M9InVpbC1yZWxvYWQiPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9Im5vbmUiIGNsYXNzPSJiayI+PC9yZWN0PgogICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTUwIDE1QTM1IDM1IDAgMSAwIDc0Ljc4NyAyNS4yMTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzOCwzOCwzOCwwLjkzKSIgc3Ryb2tlLXdpZHRoPSIxMnB4Ij48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTUwIDBMNTAgMzBMNjYgMTVMNTAgMCIgZmlsbD0icmdiYSgzOCwzOCwzOCwwLjkzKSI+PC9wYXRoPgogICAgICAgIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBmcm9tPSIwIDUwIDUwIiB0bz0iMzYwIDUwIDUwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlVHJhbnNmb3JtPgogICAgPC9nPgo8L3N2Zz4=');\n            background-size: cover;\n        }\n        \n        .trigger {\n            background-size: contain;\n            background-repeat: no-repeat;\n            background-position: center center;\n            background-image: url(\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iRWJlbmVfM19Lb3BpZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4Ig0KCSB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1OSAzMS45IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OSAzMS45OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoxLjU7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQ0KPC9zdHlsZT4NCjxwb2x5bGluZSBjbGFzcz0ic3QwIiBwb2ludHM9IjU3LjYsMS44IDI5LjUsMjkuOCAyOS41LDI5LjggMS41LDEuOCAiLz4NCjwvc3ZnPg0K\");\n            cursor: pointer;\n        }\n    "],
        providers: [{
                provide: forms_1.NG_VALUE_ACCESSOR,
                useExisting: core_1.forwardRef(function () { return ComboBoxComponent_1; }),
                multi: true
            }]
    }),
    __metadata("design:paramtypes", [])
], ComboBoxComponent);
exports.ComboBoxComponent = ComboBoxComponent;
var ComboBoxComponent_1;
//# sourceMappingURL=combo-box.component.js.map