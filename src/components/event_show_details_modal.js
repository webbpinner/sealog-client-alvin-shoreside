import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Checkbox, Row, Col, Thumbnail, ControlLabel, ListGroup, ListGroupItem, FormGroup, FormControl, FormGroupItem, Panel, Modal, Well } from 'react-bootstrap';
import { connectModal } from 'redux-modal';
import { LinkContainer } from 'react-router-bootstrap';
import LoweringReplayMap from './lowering_replay_map';
import Datetime from 'react-datetime';
import moment from 'moment';
import ImagePreviewModal from './image_preview_modal';

import * as actions from '../actions';

import { API_ROOT_URL, IMAGE_PATH, ROOT_PATH } from '../client_config';

const cookies = new Cookies();

class EventShowDetailsModal extends Component {

  constructor (props) {
    super(props);

    this.state = {
      event: {},
      mapHeight: 0
    }

    this.handleImagePreviewModal = this.handleImagePreviewModal.bind(this);

  }

  static propTypes = {
    event_id: PropTypes.string.isRequired,
    handleHide: PropTypes.func.isRequired,
    handleUpdateEvent: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.initEvent()
  }

  componentDidUpdate() {
    if(this.state.mapHeight != this.mapPanel.clientHeight) {
      this.setState({mapHeight: this.mapPanel.clientHeight });
    }
  }

  componentWillUnmount() {
  }

  initEvent() {
    axios.get(`${API_ROOT_URL}/api/v1/event_exports/${this.props.event_id}`,
      {
        headers: {
        authorization: cookies.get('token')
        }
      }      
    )
    .then((response) => {
      this.setState({event: response.data})
    })
    .catch((error) => {
      console.log(error);
    });
  }

  handleMissingImage(ev) {
    ev.target.src = `${ROOT_PATH}images/noimage.jpeg`
  }

  handleImagePreviewModal(source, filepath) {
    this.props.showModal('imagePreview', { name: source, filepath: filepath })
  }

  renderImage(source, filepath) {
    return (
      <Thumbnail onError={this.handleMissingImage} src={filepath} onClick={ () => this.handleImagePreviewModal(source, filepath)}>
        <div>{`${source}`}</div>
      </Thumbnail>
    )
  }

  renderImageryPanel() {
    if(this.props.event_id && this.state.event.aux_data) { 
      if (this.state.event.event_value == "SuliusCam") {
        let tmpData =[]

        for (let i = 0; i < this.state.event.event_options.length; i++) {
          if (this.state.event.event_options[i].event_option_name == "filename") {
            tmpData.push({source: "SuliusCam", filepath: API_ROOT_URL + IMAGE_PATH + this.state.event.event_options[i].event_option_value} )
          } 
        }

        return (
          <Row>
            {
              tmpData.map((camera) => {
                return (
                  <Col key={camera.source} xs={12} sm={6} md={6} lg={6}>
                    {this.renderImage(camera.source, camera.filepath)}
                  </Col>
                )
              })
            }
          </Row>
        )
      } else {
        let frameGrabberData = this.state.event.aux_data.find(aux_data => aux_data.data_source == 'vehicleRealtimeFramegrabberData')
        let tmpData = []

        if(frameGrabberData) {
          for (let i = 0; i < frameGrabberData.data_array.length; i+=2) {
      
            tmpData.push({source: frameGrabberData.data_array[i].data_value, filepath: API_ROOT_URL + IMAGE_PATH + frameGrabberData.data_array[i+1].data_value} )
          }

          return (
            <Row>
              {
                tmpData.map((camera) => {
                  return (
                    <Col key={camera.source} xs={12} sm={6} md={6} lg={6}>
                      {this.renderImage(camera.source, camera.filepath)}
                    </Col>
                  )
                })
              }
            </Row>
          )
        }
      }
    }
  }

  renderNavLatLonPanel() {

    let latitude = 'n/a'
    let longitude = 'n/a'
    let depth = 'n/a'
    let altitude = 'n/a'

    if(this.props.event_id && this.state.event.aux_data) { 
      let vehicleRealtimeNavData = this.state.event.aux_data.find(aux_data => aux_data.data_source == "vehicleRealtimeNavData")
      if(vehicleRealtimeNavData) {
        let latObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "latitude")
        latitude = (latObj)? `${latObj.data_value} ${latObj.data_uom}` : 'n/a'

        let lonObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "longitude")
        longitude = (lonObj)? `${lonObj.data_value} ${lonObj.data_uom}` : 'n/a'

        let depthObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "depth")
        depth = (depthObj)? `${depthObj.data_value} ${depthObj.data_uom}` : 'n/a'

        let altObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "altitude")
        altitude = (altObj)? `${altObj.data_value} ${altObj.data_uom}` : 'n/a'

      }
    }  

    return (
      <Panel>
        <Panel.Heading>Realtime Navigation</Panel.Heading>
        <Panel.Body>
          Lat:<span className="pull-right">{`${latitude}`}</span><br/>
          Lng:<span className="pull-right">{`${longitude}`}</span><br/>
          Depth:<span className="pull-right">{`${depth}`}</span><br/>
          Alt:<span className="pull-right">{`${altitude}`}</span><br/>
        </Panel.Body>
      </Panel>
    );
  }

  renderNavAlvCoordPanel() {

    let alvin_x = 'n/a'
    let alvin_y = 'n/a'
    let alvin_z = 'n/a'

    if(this.props.event_id && this.state.event.aux_data) { 
      let alvinRealtimeAlvinCoordData = this.state.event.aux_data.find(aux_data => aux_data.data_source == "vehicleRealtimeAlvinCoordData")
      if(alvinRealtimeAlvinCoordData) {
        let xObj = alvinRealtimeAlvinCoordData.data_array.find(data => data.data_name == "alvin_x")
        alvin_x = (xObj)? `${xObj.data_value} ${xObj.data_uom}` : 'n/a'

        let yObj = alvinRealtimeAlvinCoordData.data_array.find(data => data.data_name == "alvin_y")
        alvin_y = (yObj)? `${yObj.data_value} ${yObj.data_uom}` : 'n/a'

        let zObj = alvinRealtimeAlvinCoordData.data_array.find(data => data.data_name == "alvin_z")
        alvin_z = (zObj)? `${zObj.data_value} ${zObj.data_uom}` : 'n/a'

      }
    }

    return (
      <Panel>
        <Panel.Heading>Realtime Alvin Coords</Panel.Heading>
        <Panel.Body>
          X:<span className="pull-right">{`${alvin_x}`}</span><br/>
          Y:<span className="pull-right">{`${alvin_y}`}</span><br/>
          Z:<span className="pull-right">{`${alvin_z}`}</span><br/>
        </Panel.Body>
      </Panel>
    );
  }

  renderAttitudePanel() {
    let hdg = 'n/a'
    let pitch = 'n/a'
    let roll = 'n/a'

    if(this.props.event_id && this.state.event.aux_data) { 
      let vehicleRealtimeNavData = this.state.event.aux_data.find(aux_data => aux_data.data_source == "vehicleRealtimeNavData")
      if(vehicleRealtimeNavData) {
        let hdgObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "heading")
        hdg = (hdgObj)? `${hdgObj.data_value} ${hdgObj.data_uom}` : 'n/a'

        let pitchObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "pitch")
        pitch = (pitchObj)? `${pitchObj.data_value} ${pitchObj.data_uom}` : 'n/a'

        let rollObj = vehicleRealtimeNavData.data_array.find(data => data.data_name == "roll")
        roll = (rollObj)? `${rollObj.data_value} ${rollObj.data_uom}` : 'n/a'

      }
    }  

    return (
      <Panel>
        <Panel.Heading>Realtime Attitude</Panel.Heading>
        <Panel.Body>
          Hdg:<span className="pull-right">{`${hdg}`}</span><br/>
          Pitch:<span className="pull-right">{`${pitch}`}</span><br/>
          Roll:<span className="pull-right">{`${roll}`}</span><br/>
        </Panel.Body>
      </Panel>
    );
  }

  renderDataPanel() {
    let ctd_c = 'n/a'
    let ctd_t = 'n/a'
    let ctd_d = 'n/a'
    let temp_probe = 'n/a'

    if(this.props.event_id && this.state.event.aux_data) { 
      let vehicleCTDData = this.state.event.aux_data.find(aux_data => aux_data.data_source == "vehicleCTDData")
      if(vehicleCTDData) {
        let ctd_cObj = vehicleCTDData.data_array.find(data => data.data_name == "ctd_c")
        ctd_c = (ctd_cObj)? `${ctd_cObj.data_value} ${ctd_cObj.data_uom}` : 'n/a'

        let ctd_tObj = vehicleCTDData.data_array.find(data => data.data_name == "ctd_t")
        ctd_t = (ctd_tObj)? `${ctd_tObj.data_value} ${ctd_tObj.data_uom}` : 'n/a'

        let ctd_dObj = vehicleCTDData.data_array.find(data => data.data_name == "ctd_d")
        ctd_d = (ctd_dObj)? `${ctd_dObj.data_value} ${ctd_dObj.data_uom}` : 'n/a'

      }

      let vehicleTempProbeData = this.state.event.aux_data.find(aux_data => aux_data.data_source == "vehicleTempProbeData")
      if(vehicleTempProbeData) {
        let temp_probeObj = vehicleTempProbeData.data_array.find(data => data.data_name == "ctd_c")
        temp_probe = (temp_probeObj)? `${temp_probeObj.data_value} ${temp_probeObj.data_uom}` : 'n/a'
      }
    }  

    return (
      <Panel>
        <Panel.Heading>Realtime Sensor Data</Panel.Heading>
        <Panel.Body>
          CTD C:<span className="pull-right">{`${ctd_c}`}</span><br/>
          CTD T:<span className="pull-right">{`${ctd_t}`}</span><br/>
          CTD D:<span className="pull-right">{`${ctd_d}`}</span><br/>
          Temp Probe:<span className="pull-right">{`${temp_probe}`}</span><br/>
        </Panel.Body>
      </Panel>
    );
  }

  renderMap() {

    return (
      <Panel id="MapPanel" style={{backgroundColor: "#282828"}}>
        <Panel.Body style={{padding: "4px", marginBottom: "10px"}}>
          <div ref={ (mapPanel) => this.mapPanel = mapPanel} className="embed-responsive embed-responsive-16by9">
            <LoweringReplayMap height={this.state.mapHeight} event={this.state.event}/>
          </div>
          <div style={{marginTop: "8px", marginLeft: "10px"}}>Map</div>
        </Panel.Body>
      </Panel>
    )
  }


  render() {
    const { show, handleHide } = this.props

    let eventOptionsArray = [];
    let event_free_text = (this.state.event.event_free_text)? (<ListGroup><ListGroupItem>Text: {this.state.event.event_free_text}</ListGroupItem></ListGroup>) : null;
    let event_comment = null;

    if(this.state.event.event_options) {

      eventOptionsArray = this.state.event.event_options.reduce((filtered, option) => {
        if (option.event_option_name == 'event_comment') {
          event_comment = (<ListGroup><ListGroupItem>Comment: {option.event_option_value}</ListGroupItem></ListGroup>);
        } else {
          filtered.push(<ListGroupItem key={`option_${option.event_option_name}`}>{`${option.event_option_name}: "${option.event_option_value}"`}</ListGroupItem>);
        }
        return filtered
      }, [])
      
      return (
        <Modal bsSize="large" show={show} onHide={handleHide}>
            <ImagePreviewModal />;
            <Modal.Header closeButton>
              <Modal.Title>Event Details: {this.state.event.event_value}</Modal.Title>
              Date: {this.state.event.ts}<br/>
              User: {this.state.event.event_author}
            </Modal.Header>

            <Modal.Body>
              <Row>
                <Col sm={8} md={8} lg={8}>
                  {this.renderImageryPanel()}
                </Col>
                <Col sm={4} md={4} lg={4}>
                  {this.renderMap()}
                </Col>
              </Row>
              <Row>
                <Col xs={12} sm={6} md={3} lg={3}>
                  {this.renderNavLatLonPanel()}
                </Col>
                <Col xs={12} sm={6} md={3} lg={3}>
                  {this.renderNavAlvCoordPanel()}
                </Col>
                <Col xs={12} sm={6} md={3} lg={3}>
                  {this.renderAttitudePanel()}
                </Col>
                <Col xs={12} sm={6} md={3} lg={3}>
                  <ListGroup>
                    {eventOptionsArray}
                  </ListGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  {event_free_text}
                </Col>
                <Col xs={12}>
                  {event_comment}
                </Col>
              </Row>
            </Modal.Body>
        </Modal>
      );
    } else {
      return (
        <Modal bsSize="large" show={show} onHide={handleHide}>
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Loading...
          </Modal.Body>
        </Modal>
      );
    }
  }
}

function mapStateToProps(state) {

  return {
    lowering: state.lowering.lowering,
    roles: state.user.profile.roles,
  }

}

EventShowDetailsModal = connect(
  mapStateToProps, actions
)(EventShowDetailsModal)

export default connectModal({ name: 'eventShowDetails', destroyOnHide: true })(EventShowDetailsModal)
