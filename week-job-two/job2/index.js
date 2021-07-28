const tmp = `<div class="newslist">
    <div class="img" v-if="info.showImage"><img src="{{image}}"/></div>
    <div class="date" v-if="info.showDate">{{info.name}}</div>
    <div class="img">{{info.name}}</div>
</div>`;

const data = {
    image: "https://c-ssl.duitang.com/uploads/item/201511/21/20151121142243_hJ824.jpeg",
    info: {
        showImage: true,
        showDate:false,
        name: "aaa"
    }
};

let nodes = new Map();

class Vnode {
    constructor(tag, attr, children, parent, childrenTemplate) {
      this.tag = tag;
      this.attr = attr;
      this.children = children;
      this.parent = parent;
      this.childrenTemplate = childrenTemplate;
      this.uuid = this.uuid();
    }
  
    uuid() {
      return (
        Math.random() * 10000000000 +
        Math.random() * 100000 +
        Date.now()
      ).toString(36);
    }
}

function render(template, data) {
    const re1 = /<(\w+)\s*([^>\s]*)\s*([^>]*)>([^<]*)<\/\1>/gm; //匹配<div class="a">XXX</div>
    const re2 = /<(\w+)\s*([^(/>)]*)\/>/gm; //匹配<img src="a"/>
    template = template.replace(/\n/gm, "");
    while (re1.test(template) || re2.test(template)) {
      //<div class="a">XXX</div>类型
      template = template.replace(re1, (s0, s1, s2, s3, s4) => {
        let attr = this.parseAttribute(s2);
        let judge = this.parseAttribute(s3);
        let node = new Vnode(s1, attr, judge, null, s4);
        nodes.set(node.uuid, node);
        return `(${node.uuid})`;
      });
      //<img src="a"/>类型
      template = template.replace(re2, (s0, s1, s2) => {
        let attr = this.parseAttribute(s2);
        let node = new Vnode(s1, attr, [], null, "");
        nodes.set(node.uuid, node);
        return `(${node.uuid})`;
      });
    }
    console.log("第一阶段|解析创建node>>>", nodes);
    let rootNode = this.parseToNode(template);
    console.log("第二阶段|构建nodeTree>>>", rootNode);
    let dom = this.parseNodeToDom(rootNode, data);
    console.log("第三阶段|nodeTree To DomTree>>>", dom);
    return dom;
}

function parseToNode(template) {
    let re = /\((.*?)\)/g;
    let stack = [];
    let parent = new Vnode("root", {}, [], null, template, null);
    stack.push(parent);
    //转成成node节点
    while (stack.length > 0) {
      let pnode = stack.pop();
      let nodestr = pnode.childrenTemplate && pnode.childrenTemplate.trim() || '';
      re.lastIndex = 0;
      [...nodestr.matchAll(re)].forEach((item) => {
        let n = nodes.get(item[1]);
        let newn = new Vnode(
          n.tag,
          n.attr,
          [],
          pnode,
          n.childrenTemplate,
          null
        );
        pnode.children.push(newn);
        stack.push(newn);
      });
    }
    return parent.children[0];
}

function parseNodeToDom(root, data) {
    let fragment = document.createDocumentFragment();
    let stack = [[root, fragment, data]];
    //转成成node节点
    while (stack.length > 0) {
      let [pnode, pdom, scope] = stack.pop();
      if (pnode.attr.get("for")) {
        let [key, prop] = pnode.attr.get("for").split("in");
        key = key.trim();
        prop = prop.trim();
        for (let i = 0; i < scope[prop].length; i++) {
          let newnode = new Vnode(
            pnode.tag,
            pnode.attr,
            pnode.children,
            pnode.parent,
            pnode.childrenTemplate
          );
          let newScope = {};
          newScope[key] = scope[prop][i];
          let html = this.scopehtmlParse(newnode, data, newScope);
          let ele = this.createElement(newnode, html);
          this.scopeAtrrParse(ele, newnode, data, newScope);
          pdom.parentNode.appendChild(ele);
          newnode.children.forEach((item) => {
            stack.push([item, ele, newScope]);
          });
        }
      } else {
        let html = this.scopehtmlParse(pnode, data, scope);
        let ele = this.createElement(pnode, html);
        this.scopeAtrrParse(ele, pnode, data, scope);
        pdom.appendChild(ele);

        pnode.children.forEach((item) => {
          stack.push([item, ele, scope]);
        });
      }
    }
    return fragment;
}

function scopehtmlParse(node, globalScope, curentScope) {
    return node.childrenTemplate.replace(/\{\{(.*?)\}\}/g, (s0, s1, s2) => {
      let props = s1.split(".");
      let val = curentScope[props[0]] || globalScope[props[0]];
      props.slice(1).forEach((item) => {
        val = val[item];
      });
      return val;
    });
}

function scopeAtrrParse(ele, node, globalScope, curentScope) {
    console.log(node.attr);
    for (let [key, value] of node.attr) {
      let result = /\{\{(.*?)\}\}/.exec(value);
      if (result && result.length > 0) {
        let props = result[1].split(".");
        let val = curentScope[props[0]] || globalScope[props[0]];
        props.slice(1).forEach((item) => {
          val = val[item];
        });
        ele.setAttribute(key, val);
      }
    }
}

function createElement(node, html) {
    let ignoreAttr = ["for", "click"];
    let dom = document.createElement(node.tag);
    for (let [key, val] of node.attr) {
      if (!ignoreAttr.includes(key)) {
        dom.setAttribute(key, val);
      }
    }
    if (node.children.length === 0) {
      dom.innerHTML = html;
    }
    return dom;
}

function parseAttribute(str) {
    let attr = new Map();
    str = str.trim();
    str.replace(/(\w+)\s*=['"](.*?)['"]/gm, (s0, s1, s2) => {
      attr.set(s1, s2);
      return s0;
    });
    return attr;
}

function parseChildren(str) {
    str.replace(/\{\{(.*?)\}\}/gm, () => {});
}
  