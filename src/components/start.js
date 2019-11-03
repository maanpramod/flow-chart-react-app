import React, { Component } from 'react';
import { Icon, Modal, Header, Input, Button } from 'semantic-ui-react'


class Start extends Component {
    state = { 
        open: false,
        position: ""
    }

    toggleDeleteIcon = (event) => {
        if (event.target.firstChild) {
            if (event.target.firstChild.firstChild) {
                if (event.target.firstChild.firstChild.tagName) {
                    const deleteIcon = event.target.firstChild.firstChild
                    if (event.type==='mouseenter') {
                        deleteIcon.style.display = 'block';
                    } 
                    if (event.type==='mouseleave') {
                        deleteIcon.style.display = 'none';
                    }
                }
            }
        }
    }

    deLeteNode = (event) => {
        const { deleteNode } = this.props
        const node = event.target.parentElement.parentElement
        const id = event.target.parentElement.parentElement.id
        deleteNode(id)          
    }

    showModal = (size) => (event) => {
        const node = event.target.id ? event.target : event.target.parentElement.parentElement ;
        const nodeCurrentPosition =  node.style.cssText 
        const nodePreviousPosition = this.state.position
        if (nodeCurrentPosition!==nodePreviousPosition) {
            this.setState({ position: nodeCurrentPosition})
        } else {
            this.setState({ size, open: true })
        }
    }

    closeModal = () => this.setState({ open: false })


    render() { 
        const { open, size } = this.state
        const { node, id, position } = this.props
        const newNode = (
                <div>
                    <div onMouseEnter={this.toggleDeleteIcon} onMouseLeave={this.toggleDeleteIcon} 
                        onClick={this.showModal('small')}
                        className={"window jtk-node "+`${node}`} id={id}
                        style = {position && {left: (position.left), top: (position.top)}}
                    >
                        <span><Icon size='big' name='delete' id='delete-icon' onClick={this.deLeteNode}/></span>
                        <span><strong>{node}</strong></span><br/><br/>
                    </div>
                    
                    <Modal size={size} open={open} onClose={this.closeModal}>
                        <Modal.Header>start</Modal.Header>
                        <Modal.Content>
                            <Header as='h4'>Output</Header>
                            <Input size='large' placeholder='flow chart input' />
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                            onClick={this.closeModal}
                            positive
                            content='Save'
                        />
                        </Modal.Actions>
                    </Modal>
                </div>
        )
        return (newNode);
    }
}
 
export default Start;




// const Start = ({ node, id, deleteNode, position }) => {
//     const toggleDeleteIcon = (event) => {
//         if (event.target.firstChild) {
//             if (event.target.firstChild.firstChild) {
//                 if (event.target.firstChild.firstChild.tagName) {
//                     const deleteIcon = event.target.firstChild.firstChild
//                     if (event.type==='mouseenter') {
//                         deleteIcon.style.display = 'block';
//                     } 
//                     if (event.type==='mouseleave') {
//                         deleteIcon.style.display = 'none';
//                     }
//                 }
//             }
//         }
//     }

//     const deLeteNode = (event) => {
//         const node = event.target.parentElement.parentElement
//         const id = event.target.parentElement.parentElement.id
//         deleteNode(id)          
//     }


//     let newNode = (
//         <div onMouseEnter={toggleDeleteIcon} onMouseLeave={toggleDeleteIcon} 
//             className={"window jtk-node "+`${node}`} id={id}
//             style = {position && {left: (position.left), top: (position.top)}}
//             >
//             <span><Icon size='big' name='delete' id='delete-icon' onClick={deLeteNode}/></span>
//             <span><strong>{node}</strong></span><br/><br/>
//         </div>
//     )
//     return (newNode);
// }
 
// export default Start;