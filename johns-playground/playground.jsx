/** @jsx React.DOM */

var root = {};

root.componentStore = [];

root.componentStore.SearchInput = React.createClass({
    onKeyDown: function(event) {
        if (event.key === "ArrowDown") {
            this.props.setHighlightedItemRelative(true);
        } else if (event.key === "ArrowUp") {
            this.props.setHighlightedItemRelative(false);
        }
    },

    queryChanged: function(event) {
        this.props.onQueryChanged(event.target.value);
    },

    render: function() {
        return (
            <input
                type="text"
                onKeyDown={this.onKeyDown}
                onChange={this.queryChanged} />
        );
    }
});

root.componentStore.SearchDropdown = React.createClass({
    render: function() {
        var children = [];
        for (var i = 0; i < this.props.ordering.length; ++i) {
            var curName = this.props.ordering[i];
            var curConfig = this.props.datasetConfigs[curName];
            if (!curConfig) {
                throw Error("Unknown dataset " + curName + " in ordering.");
            }
            children.push(
                curConfig.component({
                    key: curName,
                    config: curConfig,
                    query: this.props.query,
                    highlightedItem: this.props.highlightedItem,
                    registerDatasetSize: this.props.registerDatasetSize,
                    setHighlightedItem: this.props.setHighlightedItem,
                })
            );
        }

        return <div>{children}</div>;
    }
});

root.componentStore.Search = React.createClass({
    // props.datasetConfigs:object<
    //     name:str => configuration:object< prop:str => value:any > >
    // Configuration for each data set.

    // state.ordering:list< name:str >
    // Defines which result sets, and in which order, are displayed.

    // state.query:str
    // The currently typed in query (what is displayed to the user)

    getInitialState: function() {
        this.datasetSizes = {};

        // The default ordering is alphabetic
        var ordering = _.map(this.props.datasetConfigs, function(v, k) {
            return k;
        });
        ordering.sort();

        return {
            ordering: ordering,
            query: "",
            highlightedItem: null,
        }
    },

    onQueryChanged: function(query) {
        this.setState({query: query});
    },

    setHighlightedItemRelative: function(moveDown) {
        if (this.state.highlightedItem === null) {
            var selectedSet = null;
            if (moveDown) {
                for (var i = 0; i < this.state.ordering.length; ++i) {
                    if (this.datasetSizes[this.state.ordering[i]] !== 0) {
                        selectedSet = this.state.ordering[i];
                        break;
                    }
                }
            } else {
                for (var i = this.state.ordering.length - 1; i >= 0; --i) {
                    if (this.datasetSizes[this.state.ordering[i]] !== 0) {
                        selectedSet = this.state.ordering[i];
                        break;
                    }
                }
            }

            if (selectedSet === null) {
                return;
            }

            this.setState({
                highlightedItem: {
                    datasetName: selectedSet,
                    index: moveDown ? 0 : this.datasetSizes[selectedSet] - 1,
                },
            });
        } else {
            var newIndex = this.state.highlightedItem.index + (moveDown? 1 : -1);

            if (newIndex >= 0 && newIndex < this.datasetSizes[this.state.highlightedItem.datasetName]) {
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
                var selectedSet = null;
                if (moveDown) {
                    for (var i = curSetIndex + 1; i < this.state.ordering.length; ++i) {
                        if (this.datasetSizes[this.state.ordering[i]] !== 0) {
                            selectedSet = this.state.ordering[i];
                            break;
                        }
                    }
                } else {
                    for (var i = curSetIndex - 1; i > 0; --i) {
                        if (this.datasetSizes[this.state.ordering[i]] !== 0) {
                            selectedSet = this.state.ordering[i];
                            break;
                        }
                    }
                }

                if (selectedSet === null) {
                    this.setState({highlightedItem: null});
                } else {
                    this.setState({highlightedItem: {
                        datasetName: selectedSet,
                        index: moveDown ? 0 : this.datasetSizes[selectedSet] - 1,
                    }});
                }
            }
        }
    },

    setHighlightedItem: function(name, index) {
        this.setState({highlightedItem: {datasetName: name, index: index}});
    },

    registerDatasetSize: function(name, size) {
        this.datasetSizes[name] = size;
    },

    render: function() {
        return (
            <div>
                <root.componentStore.SearchInput
                    onQueryChanged={this.onQueryChanged}
                    query={this.state.query}
                    setHighlightedItemRelative={this.setHighlightedItemRelative} />
                <root.componentStore.SearchDropdown
                    query={this.state.query}
                    datasetConfigs={this.props.datasetConfigs}
                    ordering={this.state.ordering}
                    highlightedItem={this.state.highlightedItem}
                    setHighlightedItem={this.setHighlightedItem}
                    registerDatasetSize={this.registerDatasetSize} />
            </div>
        );
    }
});

///////////////
// USER LAND //
///////////////

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];
var hound = substringMatcher(states);

var StatesDataset = React.createClass({
    // onPropsChange: function(event) {
    //     console.log("searching for " + this.props.controller.query);

    //     // bloodhound_go(this.props.controller.query, function(datums) {
    //     //     this.props.controller.setDatasetResults("suggestions", datums);
    //     //     this.props.controller.dispatchEvent("custom:updateFooter")
    //     //     // this.props.controller.components["footer"].updateMaybe();
    //     // });
    // },

    componentWillReceiveProps: function(nextProps) {
        console.log(nextProps);
        if (this.props.query != nextProps.query) {
            this.doQuery();
        }
    },

    getInitialState: function() {
        return {
            results: [],
        };
    },

    setResults: function(results) {
        this.state.results = results;
    },

    doQuery: function() {
        hound(this.props.query, this.setResults.bind(this));
    },

    render: function() {
        var renderedResults = [];
        for (var i = 0; i < this.state.results.length; ++i) {
            var highlighted = this.props.highlightedItem;
            var isSelected = (
                highlighted !== null &&
                highlighted.datasetName === this.props.key &&
                highlighted.index === i);
            var className = isSelected ? "selected" : "";

            var that = this;
            var hover = (function(index, event) {
                console.log(that.props.key, index);
                that.props.setHighlightedItem(that.props.key, index);
            }).bind(this, i);

            renderedResults.push(<a href="#" onMouseOver={hover} className={className}>{this.state.results[i]}</a>);
        }

        this.props.registerDatasetSize(this.props.key, renderedResults.length);

        return <ul>{renderedResults}</ul>;
    }
});

var datasetConfigs = {
    states: {component: StatesDataset},
};

React.renderComponent(
    root.componentStore.Search({datasetConfigs: datasetConfigs}),
    document.getElementById("search-bar")
);
