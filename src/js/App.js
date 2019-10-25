import React, { Component } from 'react';
import '../../node_modules/jsplumb/css/jsplumbtoolkit-defaults.css';
import '../css/jsplumbtoolkit-demo.css';
import '../css/App.css';
import 'semantic-ui-css/semantic.min.css'
import { applyJsPlumb, instance } from './jsplumb.js';
import Start from './start.js'
import Pipeline from './pipeline.js'
import Join from './join.js'
import End from './end.js'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      flowChartData: {
        ids: [],
        nodes: {}
      }
    }
  }

  componentDidUpdate = () => {
    const { flowChartData } = this.state
    applyJsPlumb(flowChartData)
  }

  componentDidMount() {
    document.addEventListener("addConnection", this.addConnection)
    document.addEventListener("deleteConnection", this.deleteConnection)
  }

  addConnection = ({ detail: { connection, dropEndpoint } }) => {
    const { sourceId, targetId } = connection
    const [sourceAnchor, targetAnchor] = [connection.endpoints[0].anchor.type, dropEndpoint.anchor.type]
    const nodes = { ...this.state.flowChartData.nodes }
    if (nodes[sourceId].outputs[targetId]) {
      const outputs = nodes[sourceId].outputs[targetId]
      nodes[sourceId].outputs[targetId] = [...outputs, targetAnchor]
    } 
    if (!nodes[sourceId].outputs[targetId]) {
      nodes[sourceId].outputs[targetId] = [targetAnchor]
    }
    if (nodes[targetId].inputs[sourceId]) {
      const inputs = nodes[targetId].inputs[sourceId]
      nodes[targetId].inputs[sourceId] = [...inputs, sourceAnchor]
    } 
    if (!nodes[targetId].inputs[sourceId]) {
      nodes[targetId].inputs[sourceId] = [sourceAnchor]
    }
    const flowChartData = {...this.state.flowChartData, nodes}
    this.setState({ flowChartData })
  }

  deleteConnection = ({ detail: { connection } }) => {
    const ids = [...this.state.flowChartData.ids]
    const nodes = { ...this.state.flowChartData.nodes }
    ids.forEach(id => {
      const name = nodes[id].name ;
      const position = this.getPosition(id)
      const { inputs, outputs } = this.getInputOutputs(id)
      const node = { name, inputs, outputs, position } 
      nodes[id] = node
    });
    const flowChartData = { ids, nodes }
    this.setState({ flowChartData })
  }

  getNodes = () => {
    const { ids, nodes } = this.state.flowChartData
    const allNode = ids.map((id, index) => {
      const { name, position } = nodes[id]
      let newNode;
      switch(name) {
        case 'start':
          newNode = (
            <Start 
              key={index} node={name} id={id} deleteNode={this.deleteNode}
              position={position}
            />
          )            
          break;
        case 'pipeline':
          newNode = (
            <Pipeline 
              key={index} node={name} id={id} deleteNode={this.deleteNode}
              position={position}
            />
          ) 
          break;
        case 'join':
          newNode = (
            <Join 
              key={index} node={name} id={id} deleteNode={this.deleteNode}
              position={position}
            />
          ) 
          break;
        default:
          newNode = (
            <End 
              key={index} node={name} id={id} deleteNode={this.deleteNode}
              position={position}
            />
          ) 
      }  
      return newNode
    })
    return allNode
  }

  getPosition = (id) => {
    const node = document.getElementById(id)
    let position = []
    if (node) {
      const { left, top } = node.style
      if (left || top) {
        position = {left: left, top: top}
      } else {
        position = { left: 0, top: 0}
      }
    }
    return position
  }

  getInputOutputs = (id, excludeId) => {
    const inputOutputs = { inputs: {}, outputs: {} }
    const inputs = instance.getConnections({ target: id })
    const outputs = instance.getConnections({ source: id })
    if (inputs) {
      for (const input of inputs) {
        const [sourceId, sourceAnchor] = [input.sourceId, input.endpoints[0].anchor.type]
        if (sourceId !== excludeId) {
          if (inputOutputs.inputs[sourceId]) {
            inputOutputs.inputs[sourceId].push(sourceAnchor)
          } else {
            inputOutputs.inputs[sourceId] = [sourceAnchor] 
          }
        }
      }
    }
    if (outputs) {
      for (const output of outputs) {
        const [targetId, targetAnchor] = [output.targetId, output.endpoints[1].anchor.type]
        if (targetId !== excludeId) {
          if (inputOutputs.outputs[targetId]) {
            inputOutputs.outputs[targetId].push(targetAnchor)
          } else {
            inputOutputs.outputs[targetId] = [targetAnchor] 
          }
        }
      }
    }
    return inputOutputs
  }

  addNode = (event) => {
    const newNodeName = event.target.innerHTML
    const randomValue = Math.random()
    const id = newNodeName + randomValue
    const ids = [...this.state.flowChartData.ids, id]
    const nodes = { ...this.state.flowChartData.nodes }
    ids.forEach(id => {
      const name = nodes[id] ? nodes[id].name : newNodeName ;
      const position = this.getPosition(id)
      const { inputs, outputs } = this.getInputOutputs(id)
      const node = { name, inputs, outputs, position } 
      nodes[id] = node
    });
    const flowChartData = { ids, nodes }
    this.setState({ flowChartData })
  }

  deleteNode = (idOfNodeToBeDeleted) => {
    const ids = this.state.flowChartData.ids.filter(id => id !== idOfNodeToBeDeleted)
    const allNode = { ...this.state.flowChartData.nodes }
    const nodes = {}
    ids.forEach(id => {
      const name = allNode[id].name ;
      const position = this.getPosition(id)
      const { inputs, outputs } = this.getInputOutputs(id, idOfNodeToBeDeleted)
      const node = { name, inputs, outputs, position } 
      nodes[id] = node
    });
    const flowChartData = { ids, nodes }
    this.setState({ flowChartData })
  }


  render() { 
    console.log(this.state.flowChartData) 
    return ( 
      <div data-demo-id="flowchart">
        <div className='flowchart-header'>
          <h2 onClick={this.addNode}>start</h2>
          <h2 onClick={this.addNode}>pipeline</h2>
          <h2 onClick={this.addNode}>join</h2>
          <h2 onClick={this.addNode}>end</h2>
        </div>
        <div className="jtk-demo-main">
          <div className="jtk-demo-canvas canvas-wide flowchart-demo jtk-surface jtk-surface-nopan" id="canvas">
            <div className='nodes-container'>{this.getNodes()}</div>
          </div>
        </div>
      </div>
    );
  }
}
 
export default App;