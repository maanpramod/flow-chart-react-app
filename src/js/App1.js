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
        nodes: [],
        positions: [],
        connections: []
      }
    }
  }

  componentDidUpdate = () => {
    const { flowChartData } = this.state
    // applyJsPlumb(flowChartData)
  }

  getNodes = () => {
    const nodes = this.state.flowChartData.nodes.map((node, index) => {
      const [name, id, position] = [node.name, node.id, this.state.flowChartData.positions[index]]
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
    return nodes
  }

  getPositions = (excludeId) => {
      const nodes = instance.getContainer().firstChild.children
      const positions = []
      for (const node of nodes) {
        if (node.firstChild.id !== excludeId) {
          const { left, top } = node.firstChild.style
          if (left || top) {
            positions.push({left: left, top: top})
          } else {
            positions.push({ left: 0, top: 0})
          }
        }
      }
      return positions
  }

  getConnections = (excludeId) => {
    const connections = []
    const allConnections = instance.getConnections()
    for (const connection of allConnections) {
      const [sourceId, targetId] = [connection.sourceId, connection.targetId]
      const [sourceAnchor, targetAnchor] = [connection.endpoints[0].anchor.type, connection.endpoints[1].anchor.type]
      if (sourceId !== excludeId && targetId !== excludeId) {
        connections.push({sourceId, sourceAnchor, targetId, targetAnchor})
      }
    }
    return connections
  }

  addNode = (event) => {
    const name = event.target.innerHTML
    const randomValue = Math.random()
    const id = name + randomValue
    const newNode = { name, id }
    const nodes = [...this.state.flowChartData.nodes, newNode]
    let [positions, connections] = [[], []];
    if (instance.getContainer()) {
        positions = this.getPositions(id)
        connections = this.getConnections(id)
    } 
    const flowChartData = {...this.state.flowChartData, nodes, positions, connections}
    this.setState({ flowChartData })
  }


  deleteNode = (id) => {
    const check = instance.getConnections({ id });
    const nodes = this.state.flowChartData.nodes.filter((node, index) => node.id !== id)
    const positions = this.getPositions(id)
    const connections = this.getConnections(id)
    const flowChartData = {...this.state.flowChartData, nodes, positions, connections}
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