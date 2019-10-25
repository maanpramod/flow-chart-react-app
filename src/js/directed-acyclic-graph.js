function DAG() {
    this.nodes = [];
    this.vertices = {};
}
   

DAG.prototype.add = function(node) {
    if (!node) { return; }
    if (this.vertices[node]) {
        return this.vertices[node];
    }
    const vertex = {
        name: node, 
        incoming: {}, 
        incomingNames: [], 
        hasOutgoing: false, 
        value: null
    };
    this.vertices[node] = vertex;
    this.nodes.push(node);
    return vertex;
};


function visit(vertex, fn, visited, path) {
    const name = vertex.name
    const vertices = vertex.incoming
    const names = vertex.incomingNames
    const len = names.length
//  i;
    if (!visited) {
        visited = {};
    }
    if (!path) {
        path = [];
    }
    if (visited.hasOwnProperty(name)) {
        return;
    }
    path.push(name);
    visited[name] = true;
    for (let i = 0; i < len; i++) {
        visit(vertices[names[i]], fn, visited, path);
    }
    fn(vertex, path);
    path.pop();
}
   

DAG.prototype.addConnection = function(fromName, toName) {
    if (!fromName || !toName || fromName === toName) {
        return;
    }

    const from = this.add(fromName)
    const to = this.add(toName);

    if (to.incoming.hasOwnProperty(fromName)) {
        return;
    }

    function checkCycle(vertex, path) {
        console.log('check cycle', vertex.name, toName)
        if (vertex.name === toName) {
            console.log('Theres a cycle foo!!!!!')
            throw new Error('Theres a cycle foo!!!!!');
        }
    }
    visit(from, checkCycle);
    from.hasOutgoing = true;
    to.incoming[fromName] = from;
    to.incomingNames.push(fromName);
};


DAG.prototype.deleteConnection = () => {

}


let dag = new DAG()
// dag.add('1')
// dag.add('2')
dag.addConnection('1', '2')
// dag.addConnection('2', '3')
dag.addConnection('1', '4')
// dag.addConnection('4', '5')
// dag.addConnection('6', '1') 
console.log(dag.nodes)
console.log(dag.vertices)