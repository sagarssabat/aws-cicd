# waf-ts-Stimulus-Boilerplate
Widget library created using webpack, typscript and stimulus. It follows same convention as LB-Website's generic naming convention and directory structure.

### Dependecies List
1. stimulus
2. es6.promise (*polyfill for promise*)
3. tslib (*polyfill require for typescript*)

### Development Dependencies
1. clean-webpack-plugin
2. glob
3. lodash
4. ts-loader
5. typescript
6. webpack
7. webpack-cli
8. webpack-dev-server

#### Steps To run webpack development server 
1.  go to project's root directory run CMD `yarn start`
2.  override lb websites bundle.js with your local main.bundle.js

#### For Deployment
1. In root directory of project run 'yarn deploy'
2. Copy js from `dist/` folder to `static-assets/scripts/stimulus/`;
3. Add script ref in si-head partial 
```HTML
<script src='static-assets/scripts/stimulus/main.bundle.js'><script>
```

#### Steps to Create controller or layout
1. Create new directory same as widget's name if not already present (`mkdir src/widgets/{widgetName}`)
2. Create layout by following convention `widget-layout-{number}.ts` ( `touch src/widgets/{widgetName}/{widget-layout-{number}}.ts` )
3. create your controller as mentioned below
```javascript
import { ApplicationObj } from "./../../main";
import { Controller } from "stimulus";

class WidgetLayout53 extends Controller {
  tabTargets: HTMLElement[];
  
  static targets = ["tab"];
  
  showTab(e: Event): void {
    console.log("test action method")
  }
}

export default () => ApplicationObj.register("{widgetname}--{widget-layout-53}", WidgetLayout53);
