/** @jsx React.DOM */

var root = {};

root.componentStore = [];

root.componentStore.SearchInput = React.createClass({
    render: function() {
        return <input type="text" />;
    }
});

root.componentStore.SearchResults = React.createClass({
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
        // The default ordering is alphabetic
        var ordering = _.map(this.datasetConfigs, function(v, k) {
            return k;
        });
        ordering.sort();

        return {
            ordering: ordering,
            query: "",
        }
    },

    render: function() {
        return (
            <div>
                <root.componentStore.SearchInput
                    // onQueryChanged={this.onQueryChanged.bind(this)}
                    query={this.state.query} />
                <root.componentStore.SearchResults
                    query={this.state.query}
                    datasetConfigs={this.props.datasetConfigs}
                    ordering={this.state.ordering} />
            </div>
        );
    }
});

///////////////
// USER LAND //
///////////////

// var BlaItem = React.createClassWithMixin(MagicItem, {
//     root_onSelect: function() {
//         this.props.controller.components["footer"].updateMaybe();
//     }

//     render: function() {
//         return <a href="#">adsf</a>
//     }
// });

var Bla = React.createClass({
    // onPropsChange: function(event) {
    //     console.log("searching for " + this.props.controller.query);

    //     // bloodhound_go(this.props.controller.query, function(datums) {
    //     //     this.props.controller.setDatasetResults("suggestions", datums);
    //     //     this.props.controller.dispatchEvent("custom:updateFooter")
    //     //     // this.props.controller.components["footer"].updateMaybe();
    //     // });
    // },

    render: function() {
        return (
            <ul>
                {this.props.results.map(function(result) {
                    return <li>{result}</li>
                })}
            </ul>
        );
    }
});

var datasetConfigs = {
    suggestions: {component: Bla},
    footer: {component: Bla},
};

React.renderComponent(
    <root.componentStore.Search datasetConfigs={datasetConfigs} />,
    document.getElementById("search-bar")
);

// myController.setDatasetResults("suggestions", ["hi", "bob"])
