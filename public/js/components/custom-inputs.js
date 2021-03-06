/**
 * Custom input element that will render a panta input with a label and input field
 *
 * @see MultiLineInput
 * @see SingleSelectInput
 * @see SingleLineInput
 */
class PInput {

    /**
     * @param document the DOM document
     * @param label a text for the label
     * @param value the initial value of the element
     * @param targetId the target HTML element to render this input to
     * @param placeholder a placeholder
     * @param type the type of input which can be one of 'input', 'textarea' or 'select'. this is used to create the input element
     * @param readonly flag to tell if this is a read-only element or not
     * @param visible flag to make the field visible or not
     */
    constructor(document, label, value, targetId, placeholder, type, readonly, visible) {
        this._document = document;
        this._label = (label.length === 0 ? "" : label);
        this._value = value;
        this._name = "name_" + targetId;
        if (targetId.startsWith(".", 0)) {
            this._target = this._document.getElementsByClassName(targetId.substr(1)).item(0);
        } else {
            this._target = this._document.getElementById(targetId);
        }
        this._type = type;
        this._placeholder = placeholder;
        this._readonly = readonly;
        this._input = this._document.createElement(this._type);
        this._inputOverlay = this._document.createElement('div');
        this._labelInput = null;
        this._property = null;
        this._propertyType = "text";
        /**
         * A flag if the field should be rendered/shown or not
         */
        this._visible = visible;
    }

    get propertyType() {
        return this._propertyType;
    }

    set propertyType(value) {
        this._propertyType = value;
    }

    setPropertyType(propertyType) {
        this.propertyType = propertyType;
        return this;
    }

    /**
     * Bind the passed entity with the input field
     * @param entity the entity to bind to
     * @param property the bound property of the entity
     * @returns {PInput} itself (for fluent-programming)
     */
    bind(entity, property) {
        this._entity = entity;
        this._property = property;
        this._value = entity[property];
        this._updateProperty();
        return this;
    }

    /**
     * Update the bound property of the input field
     * @private
     */
    _updateProperty() {
        // this should maybe use this._value instead of accessing the property directly. otherwise the _value property does not make much sense anymore
        let propertyValue = this._entity[this.getBoundProperty()];
        if (propertyValue === null) {
            this._input.value = null;
            this._inputOverlay.innerHTML = "<span class='placeholder'>" + this._placeholder + "</span>";
        } else {
            switch (this.propertyType) {
                case "number":
                    this._updateValue(this._formatNumber(propertyValue));
                    break;
                case "money":
                    this._updateValue(this._formatNumber(propertyValue, {minimumFractionDigits: 2}));
                    break;
                case 'text':
                default:
                    this._updateValue(propertyValue || "");
                    break;
            }
        }
    }

    /**
     * Update the value of the input field if it is different. Otherwise it will do nothing
     * @param newValue the new value to set
     * @private
     */
    _updateValue(newValue) {
        if (this._input !== null && this._input.value !== newValue) {
            if (this._type !== "select") {
                this._input.value = newValue;
            }
            if (isBlank(newValue)) {
                this._inputOverlay.innerHTML = "<span class='placeholder'>" + this._placeholder  + "</span>";
            } else {
                this._inputOverlay.innerHTML = isString(newValue) ? newValue.htmlify() : '';
            }
        } else {
            if (isBlank(newValue)) {
                this._inputOverlay.innerHTML = "<span class='placeholder'>" + this._placeholder  + "</span>";
            }
        }
    }

    /**
     * Set the given entity and update the underlying HTML element with the new property value
     * @param artikel
     * @returns {PInput}
     */
    update(artikel) {
        this._entity = artikel;
        this._updateProperty();
        this._updateConditionalFormatting();
        return this;
    }

    /**
     * This will render this input field to the target element. If you need to do custom stuff you can override doCustomization as this
     * method will call it
     * @returns {PInput}
     */
    render() {
        let container = this._document.createElement("div");
        if (!this._visible) {
            container.addClass("invisible");
        } else {
            container.removeClass("invisible");
        }

        this._input.setAttribute("name", this._name);
        this.setPlaceholder();
        this._input.setAttribute("title", this._label);
        this._input.setAttribute("autocomplete", "new-password");
        if (this._value) {
            this._updateProperty();
        }
        this._renderType();
        if (this._readonly) {
            this._input.setAttribute("readonly", "readonly");
        } else {
            this._input.setAttribute("tabindex", autoTabIndex());
        }

        this._input.addClass(this.propertyType)
            .addClass("u-border")
            .addClass("hidden");

        this._inputOverlay
            .addClass("input-overlay")
            .addClass(this.propertyType)
            .addClass("u-border");

        this.setupEvents();

        this._labelInput = this.setLabel();

        if (this._label.length === 0) {
            container
                .addClass("field")
                .addClass("hidden");
        } else {
            container.addClass("field");
        }

        container.appendChild(this._labelInput);
        container.appendChild(this._inputOverlay);
        container.appendChild(this._input);

        if (this._target) {
            this._target.appendChild(container);
        }
        this.doCustomization(this._input, this._labelInput, this._inputOverlay);

        return this;
    }

    setLabel(label) {
        this._label = label || this._label;
        let input = this._labelInput || this._document.createElement("label");
        input.removeChildren();
        input.appendChild(this._document.createTextNode(this._label));
        input.setAttribute("for", this._input.getAttribute("name"));
        input.addClass("prop-" + this._type);

        return input;
    }

    setPlaceholder(placeholder) {
        this._placeholder = placeholder || this._placeholder;
        this._input.placeholder = this._placeholder;
        this._input.setAttribute("placeholder", this._placeholder);
    }

    /**
     * Set specific input attributes depending on its propertyType
     * @private
     */
    _renderType() {
        if (this._type === 'input') {
            if (!this._readonly) {
                switch (this.propertyType) {
                    case "money":
                        // this._input.setAttribute("type", "number");
                        this._input.setAttribute("type", "text");
                        this._input.setAttribute("min", "0.00");
                        this._input.setAttribute("max", "1000000000.00");
                        this._input.setAttribute("step", "0.01");
                        break;
                    case "number":
                        // this._input.setAttribute("type", "number");
                        this._input.setAttribute("type", "text");
                        break;
                    default:
                        this._input.setAttribute("type", "text");
                        break;
                }
            } else {
                this._input.setAttribute("type", "text");
            }
        }
    }

    /**
     * This will set the CSS class "focused" when focusing resp. loosing focus and another CSS class "hovered"
     * when the user hovers the element resp. remove it when the mouse leaves the element
     */
    setupEvents() {
        const that = this;
        this._setClassWhenEvent(this._input, 'focus', 'blur', 'focused');
        this._setClassWhenEvent(this._input, 'mouseenter', 'mouseleave', 'hovered');
        // when user clicks the overlay it must hide the div and show the input element
        const click = function () {
            that._inputOverlay.addClass("hidden");
            that._input.removeClass("hidden");
            // focus the input element
            that._input.focus();

            // if the user leaves the input element it must hide the input and show the overlay div again
            const blur = function () {
                that._inputOverlay.removeClass("hidden");
                that._input.addClass("hidden");
            };
            that._input.removeEventListener('blur', blur);
            that._input.addEventListener('blur', blur);
        };
        this._inputOverlay.removeEventListener('click', click);
        this._inputOverlay.addEventListener('click', click);

    }

    /**
     * Add/remove the className when the event eventOn/eventOff occurs
     * @param element
     * @param eventOn
     * @param eventOff
     * @param className
     * @private
     */
    _setClassWhenEvent(element, eventOn, eventOff, className) {
        if (eventOn) {
            element.setEventListener(eventOn, function (e) {
                let target = e.currentTarget;
                target.previousElementSibling.addClass(className);
            });
        }
        if (eventOff) {
            this._input.setEventListener(eventOff, function (e) {
                let target = e.currentTarget;
                target.previousElementSibling.removeClass(className);
            });
        }
    }

    /**
     * Add the CSS class to the element
     * @param className
     * @param addToLabel if set to true it will add the class to the label instead of the input element
     * @returns {PInput}
     */
    addClass(className, addToLabel) {
        if (addToLabel === true) {
            this._labelInput.addClass(className);
        } else {
            this._input.addClass(className);
            this._inputOverlay.addClass(className);
        }
        return this;
    }

    hide() {
        if (this._target) {
            this._target.children.forEach(function (child) {
                child.addClass("invisible");
            })
        }
        return this;
    }

    show() {
        if (this._target) {
            this._target.children.forEach(function (child) {
                child.removeClass("invisible");
            })
        }
        return this;
    }

    addConditionalFormatting(rule, addToLabel) {
        if (addToLabel === true) {
            this._labelInput.addConditionalFormatting(rule);
        } else {
            this._input.addConditionalFormatting(rule);
            this._inputOverlay.addConditionalFormatting(rule);
        }
        return this;
    }

    _updateConditionalFormatting() {
        this._labelInput.applyConditionalFormatting(this._entity);
        this._input.applyConditionalFormatting(this._entity);
        this._inputOverlay.applyConditionalFormatting(this._entity);
    }

    setHeight(height) {
        this._input.style.height = height + "px";
        this._inputOverlay.style.height = height + "px";
        return this;
    }

    setPadding(top, right, bottom, left) {
        if (isNumber(top)) {
            this._input.style.paddingTop = top + "px";
            this._inputOverlay.style.paddingTop = top + "px";
        }
        if (isNumber(right)) {
            this._input.style.paddingRight = right + "px";
            this._inputOverlay.style.paddingRight = right + "px";
        }
        if (isNumber(bottom)) {
            this._input.style.paddingBottom = bottom + "px";
            this._inputOverlay.style.paddingBottom = bottom + "px";
        }
        if (isNumber(left)) {
            this._input.style.paddingLeft = left + "px";
            this._inputOverlay.style.paddingLeft = left + "px";
        }
        return this;
    }

    /**
     * Change handler that invokes the given function when the event 'change' on the element is triggered. The function
     * should accept the current instance and the context argument as its parameter
     * @param func the callback function
     * @param ctx a context object
     * @returns {PInput}
     */
    onChange(func, ctx) {
        let that = this;
        this._input.onchange = function () {
            ctx['event'] = 'change';
            func(that, ctx);
        };
        return this;
    }

    /**
     * Configure onFocus handler when this input element receives the focus (e.g. by clicking inside the element)
     * @param func
     * @param ctx
     * @returns {PInput}
     */
    onFocus(func, ctx) {
        let that = this;
        this._input.onfocus = function () {
            ctx['event'] = 'focus';
            func(that, ctx);
        };
        return this;
    }

    /**
     * Configure editing event handler respectively it will set the onblur handler because we also want to know when
     * an element looses focus
     *
     * @param func callback to be called when this element looses focus
     * @param ctx the context to be passed along the callback
     * @returns {PInput}
     */
    onEnterEditing(func, ctx) {
        let that = this;
        this._input.onblur = function () {
            ctx['event'] = 'blur';
            func(that, ctx);
        }
        return this;
    }

    /**
     * You can override this function to do custom initialization stuff
     * @param element
     * @param label
     * @param overlay the overlay element
     */
    doCustomization(element, label, overlay) {

    }

    /**
     * Get the offset height either from the overlay div or from the input element
     * @returns {number}
     */
    getOffsetHeight() {
        return Math.max(0, this._input.offsetHeight, this._inputOverlay.offsetHeight);
    }

    /**
     * Get the current value of that element
     *
     * @returns {string | number}
     */
    getValue() {
        return this._input.value;
    }

    /**
     * Get the bound property
     * @returns {null|*}
     */
    getBoundProperty() {
        return this._property;
    }

    /**
     * Get the bound entity
     *
     * @returns {*}
     */
    getBinding() {
        return this._entity;
    }

    /**
     * Apply the value on the bound entity to the bound property. After this call the "old" value is lost
     */
    setProperty() {
        switch (this.propertyType) {
            case "money":
            case "number":
                // either the input is formatted or just a plain number
                let parsed = this._parseNumber(this.getValue());
                this._entity[this.getBoundProperty()] = parsed;
                this._value = parsed;
                this._inputOverlay.innerHTML = parsed;
                break;
            default:
                this._entity[this.getBoundProperty()] = this.getValue();
                this._value = this.getValue();
                this._inputOverlay.innerHTML = this.getValue().htmlify();
                break;
        }

    }

    getTabIndex() {
        return this._readonly ? -1 : parseInt(this._input.getAttribute("tabindex"));
    }

    /**
     * Format the number using the user's locale. If it's not a number it will return an empty string (null is not working
     * in all browsers, eg. IE/Edge)
     *
     * @param number
     * @param options
     * @returns {string}
     * @private
     */
    _formatNumber(number, options) {
        let parsed = parseFloat(number);
        if (!isNaN(parsed)) {
            return parsed.toLocaleString(undefined, options);
        } else {
            return "";
        }
    }

    /**
     * Parse the literal number to its value if possible otherwise <code>null</code> is returned
     * @param number
     * @returns {*}
     * @private
     */
    _parseNumber(number) {
        if (!number) {
            return null;
        }
        let decimal = 1.23.toLocaleString();
        let sep = decimal.substr(1, 1);
        let re = new RegExp("[^\\d" + sep + "]");
        let parsed = parseFloat(number.replace(re, '').replace(sep, '.'));
        return isNaN(parsed) ? null : parsed;
    }

}

/**
 * This is a multi-line input element
 */
class MultiLineInput extends PInput {

    constructor(document, label, value, targetId, placeholder, rows, readonly, visible) {
        super(document, label, value, targetId, placeholder, "textarea", !!readonly, visible);
        this._rows = rows;
    }

    /**
     * Set the rows property of that input element (textarea)
     * @param element
     * @param label
     * @param overlay
     * @returns {*}
     */
    doCustomization(element, label, overlay) {
        element.setAttribute("rows", this._rows);
        if (isMobileBrowser()) {
            // compute the correct height of that input element to match the parent row element
            // note that this only works for one row divs and not rows that contain multi-lines
            let row = element.getClosestParentByClassName("mobile-row") || element.getClosestParentByClassName("row");
            if (row) {
                let style = getComputedStyle(element.getClosestParentByClassName("field"));
                let paddings = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                this.setHeight(((row.offsetHeight - label.offsetHeight - element.getMarginBottom() - paddings) - 1));
            } else {
                console.log("Could not find a parent with class «row» or «mobile-row»");
            }
        }
        return super.doCustomization(element, label, overlay);
    }
}

/**
 * A single-line input element. This uses a textarea input element because when using an HTML input element the rendered
 * output is different than the MultiLineInput (height) and thus does not look nicely.
 */
class SingleLineInput extends PInput {
    constructor(document, label, value, targetId, placeholder, readonly, visible) {
        super(document, label, value, targetId, placeholder, "textarea", !!readonly, visible);
    }

    /**
     * Set the no-resize class and the rows property to 1
     *
     * @param element
     * @param label
     * @param overlay
     * @returns {*}
     */
    doCustomization(element, label, overlay) {
        element.setAttribute("rows", 1);
        element.addClass('no-resize');

        if (isMobileBrowser()) {
            // compute the correct height of that input element to match the parent row element
            // note that this only works for one row divs and not rows that contain multi-lines
            let row = element.getClosestParentByClassName("mobile-row") || element.getClosestParentByClassName("row");
            if (row) {
                let style = getComputedStyle(element.getClosestParentByClassName("field"));
                let paddings = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                this.setHeight((row.offsetHeight - label.offsetHeight - element.getMarginBottom() - paddings));
            } else {
                console.log("Could not find a parent with class «row» or «mobile-row»");
            }
        }

        // TODO 26px must be computed... not quite sure why 26 pixels :-( but it works so for the moment I'm fine with it
        this.setPadding(Math.max(0, this.getOffsetHeight() - 26));
        return super.doCustomization(element, label, overlay);
    }
}

/**
 * A single select element resp. a drop-down list
 */
class SingleSelectInput extends PInput {
    constructor(document, label, value, targetId, placeholder, readonly, visible) {
        super(document, label, value, targetId, placeholder, "select", !!readonly, visible);
        this._options = [];
    }

    /**
     * Set the empty option
     * @param value
     * @param text
     * @returns {SingleSelectInput}
     */
    setEmpty(value, text) {
        this._options.splice(0, 0, {
            'value': value,
            'text': text,
            'empty': true
        });
        return this;
    }

    clear() {
        this._options.splice(0, this._options.length);
    }

    /**
     * @param {[]} options
     */
    addOptions(options) {
        let that = this;
        options.forEach(function (option) {
            that.addOption(option.value, option.text);
        });
    }

    /**
     * Add another option
     * @param value
     * @param text
     * @returns {SingleSelectInput}
     */
    addOption(value, text) {
        this._options.push({
            "value": value,
            "text": text,
            "empty": false
        });
        return this;
    }

    /**
     * Creates the HTML list/drop-down and also selects the option that matches the currently set value
     * @param element
     * @param label
     * @returns {*}
     */
    doCustomization(element, label, overlay) {
        let that = this;
        this._options.forEach(function (item, index) {
            let opt = document.createElement("option");
            opt.value = item.value;
            opt.text = item.text;
            if (parseInt(item.value) === parseInt(that._value)) {
                opt.setAttribute("selected", "selected");
            }
            element.appendChild(opt);
        });

        label.addClass('focused-fix');
        that._inputOverlay.addClass("hidden");
        element.removeClass("hidden");
        return super.doCustomization(element, label, overlay);
    }

    invalidate() {
        this._input.removeChildren();
        this._inputOverlay.removeChildren();
        this.doCustomization(this._input, this._labelInput, this._inputOverlay);
    }

}
