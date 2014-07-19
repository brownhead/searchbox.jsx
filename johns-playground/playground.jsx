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
                    controller: this.props.controller,
                    dataset: curConfig,
                    results: this.props.datasetResults[curName] || [],
                })
            );
        }

        return <div>{children}</div>;
    }
});

root.componentStore.Search = React.createClass({
    render: function() {
        return (
            <div>
                <root.componentStore.SearchInput
                    controller={this.props.controller} />
                <root.componentStore.SearchResults
                    query={this.state.query}
                    controller={this.props.controller}
                    datasetConfigs={this.props.datasetConfigs}
                    datasetResults={this.props.datasetResults}
                    ordering={this.props.ordering} />
            </div>
        );
    }
});

root.Controller = function($container, datasetConfigs) {
    var self = this;

    if ($container.length != 1) {
        throw Error("$container must contain a single element.");
    }

    // object< name:str => configuration:object< prop:str => value:any > >
    // Configuration for each data set.
    self.datasetConfigs = datasetConfigs;

    // object< name:str => results:list<any> >
    // The actual results we are or will be displaying.
    self.datasetResults = {};

    // list< name:str >
    // Defines which result sets, and in which order, are displayed.
    self.ordering = _.map(self.datasetConfigs, function(v, k) { return k; });

    self.render = function() {
        self.component = React.renderComponent(
            <root.componentStore.Search
                controller={self}
                datasetConfigs={self.datasetConfigs}
                datasetResults={self.datasetResults}
                ordering={self.ordering} />,
            $container[0]
        );
    };

    self.setOrdering = function(ordering) {
        self.ordering = ordering;
        self.render();
    }

    self.setDatasetResults = function(name, results) {
        if (!self.datasetConfigs.hasOwnProperty(name)) {
            throw Error("Unknown dataset with name '" + name + "'");
        }
        self.datasetResults[name] = results;
        self.render();
    }
}

///////////////
// USER LAND //
///////////////

var BlaFooter = React.createClass({
    didMount: function() {
        this.props.controller.selectManager.curSelection.username -> magicthing
        this.props.controller.listen("custom:updateFooter", this.updateMaybe);
    },

    updateMaybe: function() {
        for each of ["async1", "async2", "async3"] in \
                this.props.controller.components:
            if still_going:
                show_spinner
                return

        show_not_spinner
    }
});

var BlaItem = React.createClassWithMixin(MagicItem, {
    root_onSelect: function() {
        this.props.controller.components["footer"].updateMaybe();
    }

    render: function() {
        return <a href="#">adsf</a>
    }
});

var Bla = React.createClass({
    onPropsChange: function(event) {
        console.log("searching for " + this.props.controller.query);

        // bloodhound_go(this.props.controller.query, function(datums) {
        //     this.props.controller.setDatasetResults("suggestions", datums);
        //     this.props.controller.dispatchEvent("custom:updateFooter")
        //     // this.props.controller.components["footer"].updateMaybe();
        // });
    },

    render: function() {
        controller.query ->
        return (
            <ul>
                {this.props.results.map(function(result) {
                    return <BlaItem controller={this.props.controller}/>
                })}
            </ul>
        );
    }
});

var datasetConfigs = {
    async1: {component: Bla},
    async2: {component: Bla},
    async3: {component: Bla},
    footer: {component: BlaFooter},
};

var myController = new root.Controller($("#search-bar"), datasetConfigs);
myController.render();

myController.setDatasetResults("suggestions", ["hi", "bob"])
