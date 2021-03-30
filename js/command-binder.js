/**
 * @class CommanderBinding [makes just first layer of models bindinf]
 * @example {app{controllers{controllers}}}
 */
class CommanderBinding{
    apps = [];
    /**
     * [constructor inistantiate object]
     */
    constructor()
    {
        this.initApp();
        this.initControllers();
        console.log(this.apps);
    }
    /**
     * [initApp initiate app sections]
     */
    initApp()
    {
        let apps = document.querySelectorAll("[command-app]");
        for (const element of apps) {
            let attribute = element.getAttribute('command-app');
            this.apps[attribute] = {
                "element" : element, 
                "name":attribute, 
                "controllers":[]
            };
        }
    }

    


    /**
     * [initControllers initiate app controllers]
     */
    initControllers()
    {
        let apps = this.apps;
        for (const index in apps) {
            let app = apps[index];
            let element = app.element;
            let controllers = element.querySelectorAll("[command-controller]");
            for (const controller of controllers) {
                if(isset(controller) && controller){
                    let attribute = controller.getAttribute('command-controller');                
                    let new_item = {
                        "element" : controller, 
                        "name" : attribute, 
                        "models" : [],
                        "binding_targets" : [],
                        "app" : app.name,
                    };
                    this.apps[app.name]['controllers'][attribute] = new_item;
                    this.initModels(new_item);
                    this.initBindTargets(new_item);
                    this.initTargets(new_item);
                }
            }
        }
    }
    /**
     * [initTargets initiate app Models targets]
     * @param {object} controller
     * @param {object} controller.element
     * @param {string} controller.name
     * @param {array} controller.models
     * @param {array} controller.binding_targets
     * @param {string} controller.app
     */
    initTargets(controller)
    {
        let element = controller.element;
        let child = element.childNodes
        for (const children of child) {
            // if the child is text
            if(children.nodeName == "#text")
            {
                let value = children.nodeValue;
                if(value.search(/<%\s*[\w]+\s*%>/gm) > -1){
                    let matches = value.match(/((?<=\s*)([\w]+)(?=\s*%>))/gm);
                    for (const item of matches) {
                        let new_item = {
                            "element" : children, 
                            "name" : item,
                            "value" : value,
                            "type" : "text",
                            "attribute" : null
                        };
                        if (this.apps[controller.app]['controllers'][controller.name]['binding_targets'].hasOwnProperty(item)){
                            this.apps[controller.app]['controllers'][controller.name]['binding_targets'][item].push(new_item);
                        }else{
                            this.apps[controller.app]['controllers'][controller.name]['binding_targets'][item] = [new_item];
                        }
                        
                        let text = replaceAll(value, "<%\s*"+item+"\s*%>", '');
                        children.nodeValue = text;
                    }
                }
                continue;
            }
            let attributes = children.attributes;
            for (const index in attributes) {
                let attribute = attributes[index];
                let value =  attribute.value;
                if(isset(value) &&  value.search(/<%\s*[\w]+\s*%>/gm) > -1){
                    let matches = value.match(/((?<=\s*)([\w]+)(?=\s*%>))/gm);
                    for (const item of matches) {
                        let new_item = {
                            "element" : children, 
                            "name" : item,
                            "value" : attribute.value,
                            "type" : "attribute",
                            "attribute" : attribute.name,
                        };
                        if (this.apps[controller.app]['controllers'][controller.name]['binding_targets'].hasOwnProperty(item)){
                            this.apps[controller.app]['controllers'][controller.name]['binding_targets'][item].push(new_item);
                        }else{
                            this.apps[controller.app]['controllers'][controller.name]['binding_targets'][item] = [new_item];
                        }
                        let text = replaceAll(attribute.value, "<%\s*"+item+"\s*%>", '');
                        children.setAttribute(attribute.name, text);
                    }
                }

            }

            if(children.childNodes.length > 0){
                let new_item = controller;
                new_item.element = children;
                this.initTargets(new_item);
            }
        }


    }
    /**
     * [initModels initiate app Models targets that enabled from command-bind]
     * @param {object} controller
     * @param {object} controller.element
     * @param {string} controller.name
     * @param {array} controller.models
     * @param {array} controller.binding_targets
     * @param {string} controller.app
     */
    initBindTargets(controller)
    {
        let element = controller.element;
        let binding_targets = element.querySelectorAll("[command-bind]");
        for (const target of binding_targets) {
            let attribute = target.getAttribute('command-bind');

            let new_item = {
                "element" : target, 
                "name" : attribute, 
                "value" : isset(this.apps[controller.app]['controllers'][controller.name]['models'][attribute])?this.apps[controller.app]['controllers'][controller.name]['models'][attribute].value:null,
                "type" : "element",
                "attribute" : null
            }

            if (this.apps[controller.app]['controllers'][controller.name]['binding_targets'].hasOwnProperty(attribute)){
                this.apps[controller.app]['controllers'][controller.name]['binding_targets'][attribute].push(new_item);
            }else{
                this.apps[controller.app]['controllers'][controller.name]['binding_targets'][attribute] = [new_item];
            }
            if(target.childNodes.length > 0){
                new_item = controller;
                new_item.element = target
                this.initBindTargets(new_item);
            }
            target.innerText = '';
        }
    }

    /**
     * [initModels initiate app Models targets]
     * @param {object} controller
     * @param {object} controller.element
     * @param {string} controller.name
     * @param {array} controller.models
     * @param {array} controller.binding_targets
     * @param {string} controller.app
     */
    initModels(controller)
    {
        // dd(controller);
        let element = controller.element;
        let models = element.querySelectorAll("[command-model]");

        for (const model of models) {
            let attribute = model.getAttribute('command-model');
            let new_item = {
                "element" : model, 
                "name" : attribute, 
                "value" : model.value, 
                "app" : controller.app,
                "controller" : controller.name
            };
            this.listen(new_item);
            if (this.apps[controller.app]['controllers'][controller.name]['models'].hasOwnProperty(attribute)){
                this.apps[controller.app]['controllers'][controller.name]['models'][attribute].push(new_item);
            }else{
                this.apps[controller.app]['controllers'][controller.name]['models'][attribute] = [new_item];
            }

            if(model.childNodes.length >0){
                new_item = controller;
                new_item.element = model
                this.initModels(new_item);
            }
        }
    }

    /**
     * give listener to models
     * @param {object} model.element 
     * @param {string} model.name 
     * @param {string} model.value 
     */
    listen (model)
    {
        let element = model.element;
        let tagName = element.tagName.toLowerCase();
        if(!in_array(tagName, ["input", 'textarea', 'form', 'select'])){
            element.addEventListener("click", function(event){
                binder.bind(model);
            });
        }else if(tagName !== "form"){
            let attribute = element.getAttribute("type");
            if(!isset(attribute) || !attribute || attribute.toLowerCase() !=='file'){
                element.addEventListener("keyup", function(event){
                    binder.bind(model, this.value);
                });
            }
            element.addEventListener("change", function(event){
                binder.bind(model, this.value);
            });
            
        }
    }
    /**
     * [bind binds the model value into their targets]
     * @param {object} model 
     * @param {*} value 
     */
    bind(model, value)
    {
        let targets = this.apps[model.app]['controllers'][model.controller]['binding_targets'][model.name];
        
        for (const target of targets) {
            if(target.type == "element"){
                target.element.innerText = value;
            }else{
                let text = target.value;
                let regex = new RegExp("<%\s*"+target.name+"\s*%>", "gm");
                if(!text.search(regex) >= 0){
                    text = replaceAll(text, "<%\s*"+target.name+"\s*%>", value);
                    switch(target.type)
                    {
                        case "attribute" :
                            target.element.setAttribute(target.attribute, text);
                            break;
                        default:
                            target.element.nodeValue = text;  
                            break;
                    }
                }
            }
            
        }
    }
}

var binder = new CommanderBinding;