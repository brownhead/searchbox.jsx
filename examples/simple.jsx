/** @jsx React.DOM */

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

// constructs the suggestion engine
var stateHound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
    local: $.map(states, function(state) {
        return {
            value: state,
            href: "#" + state,
            key: state,
        };
    })
});
 
// kicks off the loading/processing of `local` and `prefetch`
stateHound.initialize();

var StatesDataset = searchbar.datasets.SimpleBloodhound(stateHound.ttAdapter(),
                                                        true);

var datasetConfigs = {
    states: {component: StatesDataset},
};

React.renderComponent(
    searchbar.components.Search({datasetConfigs: datasetConfigs}),
    document.getElementById("searchbar-the-basics")
);
