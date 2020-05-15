var _ = require("lodash");
var glob = require('glob');
var fs = require("fs");

var widgets = glob.sync('./src/widgets/**/widget-layout-**.ts').map(widget => {
    let [widgetName, layoutName] = _.takeRight(widget.split('/'), 2);
    return {
        widgetName,
        layoutName
    };
});
var widgetGroups = _.groupBy(widgets, 'widgetName');

var funcsCode = '';
var replacehypenUnderscore = str => str.split('-').join('_');;
for (const key in widgetGroups) {
    funcsCode += ` function Get_${ replacehypenUnderscore(key) }(layout: string){
        switch(layout){
            ${ widgetGroups[key].map(layout => {
                return `case '${ layout.layoutName.replace('.ts','') }':
                            return import(/* webpackChunkName: "${ layout.widgetName }--${ layout.layoutName.replace('.ts','') }" */ './widgets/${ layout.widgetName }/${ layout.layoutName.replace('.ts','') }');`;
            }).join('')}
            default:
                return null;
        }
    }
    `;
}

funcsCode += ` export default function (widgetName: string, LayoutName: string){
    switch(widgetName) {
       ${ Object.keys(widgetGroups).map(widget => {
            return `case '${ widget }':
                        return Get_${ replacehypenUnderscore(widget) }(LayoutName);`;
        }).join('') }
        default:
            return null;
    }
}`;

fs.writeFileSync('./src/widgetFactory.ts', funcsCode);