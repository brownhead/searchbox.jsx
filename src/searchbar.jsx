/** @jsx React.DOM */

var searchbar = (function () { // beginning of module

var root = {};

root.components = {};
root.datasets = {};
root.mixins = {};
root.utils = {};

root.utils.highlight = function highlight(str, tokens, startTag, endTag) {
    // http://stackoverflow.com/a/6969486
    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    var escapedTokens = tokens.map(escapeRegExp);
    var re = new RegExp(escapedTokens.join("|"), "gi");
    return str.replace(re, startTag + "$&" + endTag);
}

root.components.SearchInput = React.createClass({
    onKeyDown: function(event) {
        if (event.key === "ArrowDown") {
            this.props.controller.setHighlightedItemRelative(true);
        } else if (event.key === "ArrowUp") {
            this.props.controller.setHighlightedItemRelative(false);
        } else if (event.key === "Tab" && this.props.fadedText) {
            event.preventDefault();
            this.props.controller.setState({"query": this.props.fadedText});
        }
    },

    queryChanged: function(event) {
        this.props.controller.setState({"query": event.target.value});
    },

    prepareFaded: function() {
        var query = this.props.query;
        var fadedText = this.props.fadedText;

        if (query.length > fadedText.length) {
            return null;
        }

        var len = Math.min(query.length, fadedText.length);

        var newFadedText = [];
        for (var i = 0; i < len; ++i) {
            if (query[i] === fadedText[i]) {
                newFadedText.push(query[i]);
            } else if (query[i] === fadedText[i].toLowerCase()) {
                newFadedText.push(fadedText[i].toLowerCase());
            } else if (query[i] === fadedText[i].toUpperCase()) {
                newFadedText.push(fadedText[i].toUpperCase());
            } else {
                return null;
            }
        }

        for (; i < fadedText.length; ++i) {
            newFadedText.push(fadedText[i]);
        }

        return newFadedText.join("");
    },

    render: function() {
        var inputs = [];
        inputs.push(
            <input
                key="foreground"
                className="searchbar-foreground-input"
                type="text"
                value={this.props.query}
                onKeyDown={this.onKeyDown}
                onChange={this.queryChanged}
                style={{position: "absolute", background: "transparent", zIndex: 2}} />
        );

        var preparedFadedText = this.prepareFaded();
        if (preparedFadedText) {
            inputs.push(
                <input
                    key="faded"
                    className="searchbar-faded-input"
                    type="text"
                    value={preparedFadedText}
                    readOnly
                    style={{color: "#CCC", position: "absolute", background: "transparent", zIndex: 1}} />
            );
        }

        return (
            // TODO(johnsullivan): Use JQuery UI to accurately position things.
            <div className="searchbar-input-container" style={{height: 30, width: 100}}>
                {inputs}
            </div>
        );
    }
});

root.components.Search = React.createClass({
    getInitialState: function() {
        // The default ordering is alphabetic
        var ordering = _.map(this.props.datasetConfigs, function(v, k) {
            return k;
        });
        ordering.sort();

        return {
            ordering: ordering,
            query: "",
            fadedText: "",
            highlightedItem: null,
        }
    },

    componentDidMount: function() {
        $(this.refs.results.getDOMNode()).position({
            my: "left top",
            at: "left bottom",
            of: $(this.refs.input.getDOMNode()),
        });
    },

    setHighlightedItemRelative: function(moveDown) {
        var that = this;

        var numItemsIn = function(name) {
            return that.refs["dataset_" + name].numItems;
        };

        var findNextDataset = function(start) {
            if (moveDown) {
                for (var i = start; i < that.state.ordering.length; ++i) {
                    if (numItemsIn(that.state.ordering[i]) !== 0) {
                        return that.state.ordering[i];
                    }
                }
            } else {
                for (var i = start; i >= 0; --i) {
                    if (numItemsIn(that.state.ordering[i]) !== 0) {
                        return that.state.ordering[i];
                    }
                }
            }

            return null;
        };

        if (this.state.highlightedItem === null) {
            var selectedSet = findNextDataset(
                moveDown ? 0: this.state.ordering.length - 1);

            if (selectedSet === null) {
                return;
            }

            this.setState({
                highlightedItem: {
                    datasetName: selectedSet,
                    index: moveDown ? 0 : numItemsIn(selectedSet) - 1,
                },
            });
        } else {
            var newIndex = this.state.highlightedItem.index + (moveDown? 1 : -1);

            if (newIndex >= 0 && newIndex < numItemsIn(this.state.highlightedItem.datasetName)) {
                // We're moving within a dataset
                this.setState({
                    highlightedItem: {
                        datasetName: this.state.highlightedItem.datasetName,
                        index: newIndex,
                    }
                });
            } else {
                // We're moving to another dataset
                var curSetIndex = $.inArray(
                    this.state.highlightedItem.datasetName,
                    this.state.ordering);
                var selectedSet = findNextDataset(curSetIndex + (moveDown ? 1 : -1));

                if (selectedSet === null) {
                    this.setState({highlightedItem: null});
                } else {
                    this.setState({highlightedItem: {
                        datasetName: selectedSet,
                        index: moveDown ? 0 : numItemsIn(selectedSet) - 1,
                    }});
                }
            }
        }
    },

    render: function() {
        var datasets = [];
        for (var i = 0; i < this.state.ordering.length; ++i) {
            var curName = this.state.ordering[i];
            var curConfig = this.props.datasetConfigs[curName];
            if (!curConfig) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }

            var highlightedIndex = -1;
            if (this.state.highlightedItem &&
                    curName === this.state.highlightedItem.datasetName) {
                highlightedIndex = this.state.highlightedItem.index;
            }

            datasets.push(
                curConfig.component({
                    ref: "dataset_" + curName,
                    key: curName,
                    controller: this,
                    config: curConfig,
                    query: this.state.query,
                    highlightedIndex: highlightedIndex,
                })
            );
        }

        var resultsDiv = {
            position: "absolute"
        }
        return (
            <div className="searchbar-container">
                <root.components.SearchInput
                    ref="input"
                    controller={this}
                    query={this.state.query}
                    fadedText={this.state.fadedText} />
                <div
                    className="searchbar-dataset-container"
                    style={{position: "absolute"}}
                    ref = "results">
                        {datasets}
                </div>
            </div>
        );
    }
});

root.mixins.BaseDataset = {
    getHoverHandler: function(index) {
        var that = this;
        return function() {
            that.props.controller.setState({
                highlightedItem: {datasetName: that.props.key, index: index}});
        }
    }
};

root.mixins.BloodhoundDataset = function(source, setFadedText) { return {
    getInitialState: function() {
        return {
            results: [],
        };
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.props.query != prevProps.query) {
            this.doQuery();
        }
    },

    setResults: function(results) {
        this.setState({results: results});
        if (setFadedText && results.length > 0) {
            this.props.controller.setState({fadedText: results[0].value});
        } else {
            this.props.controller.setState({fadedText: ""});
        }
    },

    doQuery: function() {
        source(this.props.query, this.setResults);
    },
}};

root.datasets.SimpleBloodhound = function(source, setFadedText) {
    return React.createClass({
        mixins: [
            root.mixins.BaseDataset,
            root.mixins.BloodhoundDataset(source, setFadedText)],

        render: function() {
            var renderedResults = [];
            for (var i = 0; i < this.state.results.length; ++i) {
                var isSelected = this.props.highlightedIndex === i;
                var className = isSelected ? "selected" : "";

                var highlighted = root.utils.highlight(
                    this.state.results[i].value,
                    Bloodhound.tokenizers.whitespace(this.props.query),
                    "<b>",
                    "</b>"
                );

                renderedResults.push(
                    <div className="searchbar-result">
                        <a
                            key={this.state.results[i].key}
                            href={this.state.results[i].href}
                            onMouseOver={this.getHoverHandler(i)}
                            className={className}
                            dangerouslySetInnerHTML={{__html: highlighted}} />
                    </div>
                );
            }

            this.numItems = this.state.results.length;

            return <div>{renderedResults}</div>;
        }
    });
}

return root;
})(); // end of module
