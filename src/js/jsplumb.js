import { jsPlumb } from 'jsplumb' 
let flowChartData;

export const instance = window.jsp = jsPlumb.getInstance({
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    ConnectionOverlays: [
        [ "Arrow", {
            location: 1,
            visible:true,
            width:11,
            length:11,
            id:"ARROW",
            events:{
                click:function() { alert("you clicked on the arrow overlay")}
            }
        } ],
        // [ "Label", {
        //     location: 0.1,
        //     id: "label",
        //     cssClass: "aLabel",
        //     events:{
        //         tap: (params) => { 
        //             console.log(params)
        //             // alert("hey"); 
        //             // instance.bind("click", (conn) => {
        //                 // instance.detach(conn);
        //                 // instance.deleteConnection(conn)
        //             // });
        //         }
        //     }
        // }]
    ],
    Container: "canvas"
});

const connectorPaintStyle = {
        strokeWidth: 2,
        stroke: "#61B7CF",
        joinstyle: "round",
        outlineStroke: "white",
        outlineWidth: 2
}

const connectorHoverStyle = {
    strokeWidth: 3,
    stroke: "#216477",
    outlineWidth: 5,
    outlineStroke: "white"
}

const endpointHoverStyle = {
    fill: "#216477",
    stroke: "#216477"
}

const sourceEndpoint = {
    endpoint: "Dot",
    paintStyle: {
        stroke: "#7AB02C",
        fill: "transparent",
        radius: 7,
        strokeWidth: 1
    },
    isSource: true,
    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    maxConnections: 2,
    dragOptions: {},
    overlays: [
        [ "Label", {
            location: [0.5, 1.5],
            label: "Drag",
            cssClass: "endpointSourceLabel",
            visible:false
        } ]
    ]
}

const targetEndpoint = {
    endpoint: "Dot",
    paintStyle: { fill: "#7AB02C", radius: 7 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: 1,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,
    overlays: [
        [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    ]
}

const  _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
    for (var i = 0; i < sourceAnchors.length; i++) {
        var sourceUUID = toId + sourceAnchors[i];
        instance.addEndpoint(toId, sourceEndpoint, {
            anchor: sourceAnchors[i], uuid: sourceUUID
        });
    }
    for (var j = 0; j < targetAnchors.length; j++) {
        var targetUUID = toId + targetAnchors[j];
        instance.addEndpoint(toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
    }
};




const  flowChart = () => { 
    const { ids, nodes } = flowChartData

    const addEndpoints = (() => {
        ids.forEach(id => {
            const toId = id
            const name = nodes[id].name
            switch(name) {
                case 'start':
                    _addEndpoints(toId, ["RightMiddle"], []);
                    break;
                case 'pipeline':
                    _addEndpoints(toId, ["BottomCenter"], ["TopCenter"]);
                    break;
                case 'join':
                    _addEndpoints(toId, ["RightMiddle"], ["TopCenter", "LeftMiddle", "BottomCenter"]);
                    break;
                default:
                    _addEndpoints(toId, [], ["LeftMiddle"]);
            }
        })
    })()

    const makeNodesDragable = (() => {
        instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
    })()

    const addConnections = (() => {
        for (const id of ids) {
            const targets = nodes[id].outputs
            for (const targetId in targets) {
                const targetAnchors = targets[targetId]
                const inputsOfTarget = nodes[targetId].inputs
                const sourceId = id
                const sourceAnchors = inputsOfTarget[sourceId]
                for (const index in sourceAnchors) {
                    const [sourceAnchor, targetAnchor]= [sourceAnchors[index], targetAnchors[index]]
                    instance.connect({uuids: [sourceId+sourceAnchor, targetId+targetAnchor]});
                }
            }
        }     
    })()


    const deleteConnection = (() => {
        instance.bind("click", (connection) => {
            instance.deleteConnection(connection)
            const deleteConnection = new CustomEvent("deleteConnection", { detail: { connection } });
            document.dispatchEvent(deleteConnection);
        });
    })()

    const stopCycleInFlowChart = (() => {
        instance.bind("beforeDrop", ({ connection, dropEndpoint }) => {
            const { sourceId, targetId } = connection
            if (sourceId === targetId) {
                return false
            }

            let error;

            const checkCycle = (id, path) => {
                if (id === targetId) {
                    error = 'There is a cycle'
                    // throw new Error('Theres a cycle foo!!!!!');
                }
            }

            const visitInFlowChart = (id, checkCycle, visited, path) => {
                const node = nodes[id]
                const inputs = node.inputs
                if (!visited) { visited = {} }
                if (!path) { path = [] }
                if (visited.hasOwnProperty(id)) return ;
                path.push(id);
                visited[id] = true;
                for (const id in inputs) {
                    visitInFlowChart(id, checkCycle, visited, path);
                }
                checkCycle(id, path);
                path.pop();
            }

            visitInFlowChart(sourceId, checkCycle)
            
            if (error) return false ;

            const addConnection = (() => { 
                const addConnection = new CustomEvent("addConnection", { detail: { connection, dropEndpoint } });
                document.dispatchEvent(addConnection);
            })()

            return true
        })
    })()
};


export const applyJsPlumb = (flowChartDaTa) => {
    flowChartData = flowChartDaTa
    instance.reset()
    jsPlumb.ready(flowChart);
};  