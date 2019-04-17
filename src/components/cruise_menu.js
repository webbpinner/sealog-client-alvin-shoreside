import axios from 'axios';
import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Row, Col, Panel, PanelGroup, ListGroup, ListGroupItem } from 'react-bootstrap';
import FileDownload from 'js-file-download';
import { API_ROOT_URL, MAIN_SCREEN_TXT } from '../client_config';

import * as actions from '../actions';

const CRUISE_ROUTE = "/files/cruises";
const LOWERING_ROUTE = "/files/lowerings";

const cookies = new Cookies();

class CruiseMenu extends Component {

  constructor (props) {
    super(props);

    this.state = {
      activeYearKey: 0,
      // activeCruiseKey: 0,
      years: null,
      yearCruises: null,
      cruiseLowerings: null,
      activeCruise: null,
      activeLowering: null
    };

    this.handleYearSelect = this.handleYearSelect.bind(this);
    this.handleCruiseSelect = this.handleCruiseSelect.bind(this);
    this.handleLoweringSelect = this.handleLoweringSelect.bind(this);
    this.handleCruiseFileDownload = this.handleCruiseFileDownload.bind(this);
    this.handleLoweringFileDownload = this.handleLoweringFileDownload.bind(this);

  }

  componentDidMount(){
    this.props.fetchCruises();
    this.props.fetchLowerings();

    if(this.props.cruise.id) {
      this.handleYearSelect(moment.utc(this.props.cruise.start_ts).format("YYYY"))
      this.handleCruiseSelect(this.props.cruise.id)
    };

    if(this.props.lowering.id) {
      this.handleLoweringSelect(this.props.lowering.id)
    }
  }

  componentDidUpdate(){
    if(this.props.cruises.length > 0 && this.state.years === null) {
      this.buildYearList()
    }
  }

  componentWillUnmount(){
  }

  handleCruiseSelect(id) {
    this.props.initCruise(id)
    if(this.state.activeCruise ==null || this.state.activeCruise.id != id) {
      window.scrollTo(0, 0);
      const activeCruise = this.props.cruises.find(cruise => cruise.id === id)
      this.buildLoweringList(activeCruise.start_ts, activeCruise.stop_ts)
      this.setState({activeCruise: activeCruise, activeLowering: null });
    }
  }

  handleLoweringSelect(id) {
    window.scrollTo(0, 0);
    this.props.initLowering(id)
    this.setState({activeLowering: this.props.lowerings.find(lowering => lowering.id === id)});
  }

  handleLoweringSelectForReplay() {
    if(this.state.activeLowering) {
      this.props.gotoLoweringReplay(this.state.activeLowering.id);
    }
  }

  handleLoweringSelectForSearch() {
    if(this.state.activeLowering) {
      this.props.gotoLoweringSearch(this.state.activeLowering.id);
    }
  }

  handleLoweringFileDownload(loweringID, filename) {
    axios.get(`${API_ROOT_URL}${LOWERING_ROUTE}/${loweringID}/${filename}`,
    {
      headers: {
        authorization: cookies.get('token')
      },
      responseType: 'arraybuffer'
    })
    .then((response) => {
      
        FileDownload(response.data, filename);
     })
    .catch((error)=>{
      console.log("JWT is invalid, logging out");
    });
  }

  handleCruiseFileDownload(cruiseID, filename) {
    axios.get(`${API_ROOT_URL}${CRUISE_ROUTE}/${cruiseID}/${filename}`,
    {
      headers: {
        authorization: cookies.get('token')
      },
      responseType: 'arraybuffer'
    })
    .then((response) => {

        FileDownload(response.data, filename);
     })
    .catch((error)=>{
      console.log("JWT is invalid, logging out");
    });
  }

  handleYearSelect(activeYearKey) {
    this.setState({ activeYearKey: activeYearKey})
    this.buildCruiseList(activeYearKey)
  }

  renderCruiseFiles(cruiseID, files) {
    let output = files.map((file, index) => {
      return <li style={{ listStyleType: "none" }} key={`file_${index}`}><span onClick={() => this.handleCruiseFileDownload(cruiseID, file)}><FontAwesomeIcon className='text-primary' icon='download' fixedWidth /></span><span> {file}</span></li>
    })
    return <div>{output}<br/></div>
  }

  renderLoweringFiles(loweringID, files) {
    let output = files.map((file, index) => {
      return <li style={{ listStyleType: "none" }} key={`file_${index}`}><span onClick={() => this.handleLoweringFileDownload(loweringID, file)}><FontAwesomeIcon className='text-primary' icon='download' fixedWidth /></span><span> {file}</span></li>
    })
    return <div>{output}<br/></div>
  }

  renderLoweringPanel() {

    if(this.state.activeLowering){
      let loweringDescription = (this.state.activeLowering.lowering_additional_meta.lowering_description)? <span><strong>Description:</strong> {this.state.activeLowering.lowering_additional_meta.lowering_description}<br/></span> : null
      let loweringLocation = (this.state.activeLowering.lowering_location)? <span><strong>Location:</strong> {this.state.activeLowering.lowering_location}<br/></span> : null
      let loweringPilot = (this.state.activeLowering.lowering_additional_meta.lowering_pilot)? <span><strong>Pilot:</strong> {this.state.activeLowering.lowering_additional_meta.lowering_pilot}<br/></span> : null
      let loweringObservers = (this.state.activeLowering.lowering_additional_meta.lowering_observers && this.state.activeLowering.lowering_additional_meta.lowering_observers.length > 0)? <span><strong>Observers:</strong> {this.state.activeLowering.lowering_additional_meta.lowering_observers.join(", ")}<br/></span> : null
      let loweringFiles = (this.state.activeLowering.lowering_additional_meta.lowering_files && this.state.activeLowering.lowering_additional_meta.lowering_files.length > 0)? this.renderLoweringFiles(this.state.activeLowering.id, this.state.activeLowering.lowering_additional_meta.lowering_files): null
      let loweringDates = <span><strong>Date:</strong> {moment.utc(this.state.activeLowering.start_ts).format("YYYY/MM/DD HH:mm")} - {moment.utc(this.state.activeLowering.stop_ts).format("YYYY/MM/DD HH:mm")}<br/></span>
      
      return (          
        <Panel>
          <Panel.Heading>{"Lowering: " + this.state.activeLowering.lowering_id}</Panel.Heading>
          <Panel.Body>
            <p>
              {loweringDescription}
              {loweringLocation}
              {loweringDates}
              {loweringPilot}
              {loweringObservers}
            </p>
            {loweringFiles}
            <Button bsSize={'xs'} bsStyle={'primary'} onClick={ () => this.handleLoweringSelectForReplay(this.state.activeLowering.id) }>Goto replay...</Button>
            <Button bsSize={'xs'} bsStyle={'primary'} onClick={ () => this.handleLoweringSelectForSearch(this.state.activeLowering.id) }>Goto review...</Button>
          </Panel.Body>
        </Panel>
      );
    }
  }

  buildYearList() {
    this.setState({
      years: new Set(this.props.cruises.map((cruise) => {
        return moment.utc(cruise.start_ts).format("YYYY")
      }))
    });
  }

  buildCruiseList(year) {
    let startOfYear = new Date(year)
    let endOfYear = new Date(startOfYear.getFullYear()+1, startOfYear.getMonth(), startOfYear.getDate())
    let yearCruises =  this.props.cruises.filter(cruise => moment.utc(cruise.start_ts).isBetween(startOfYear, endOfYear))

    this.setState({ yearCruises: this.props.cruises.filter(cruise => moment.utc(cruise.start_ts).isBetween(moment.utc(startOfYear), moment.utc(endOfYear))) })
  }

  buildLoweringList(start_ts, stop_ts) {
    this.setState({ cruiseLowerings: this.props.lowerings.filter(lowering => moment.utc(lowering.start_ts).isBetween(start_ts, stop_ts)) })
  }

  renderYearListItems() {

    let years = []

    let cruise = (this.state.yearCruises)? (
      <ul>
        { this.state.yearCruises.map(cruise => (
          <li key={`select_${cruise.id}`} ><Link to="#" onClick={ () => this.handleCruiseSelect(cruise.id) }>{cruise.cruise_id}</Link><br/></li>
          ))
        }
      </ul>
    ): null

    this.state.years.forEach((year) => {
      years.push(          
        <Panel key={`year_${year}`} eventKey={year.toString()}>
          <Panel.Heading><Panel.Title toggle>{"Year: " + year}</Panel.Title></Panel.Heading>
          <Panel.Body collapsible>
            <p><strong>Cruises:</strong></p>
            {cruise}
          </Panel.Body>
        </Panel>
      );
    })

    return years    
  }

  renderCruisePanel() {

    if(this.state.activeCruise) {

      let cruiseFiles = (this.state.activeCruise.cruise_additional_meta.cruise_files && this.state.activeCruise.cruise_additional_meta.cruise_files.length > 0)? this.renderCruiseFiles(this.state.activeCruise.id, this.state.activeCruise.cruise_additional_meta.cruise_files): null

      let cruiseName = (this.state.activeCruise.cruise_additional_meta.cruise_name)? <span><strong>Cruise Name:</strong> {this.state.activeCruise.cruise_additional_meta.cruise_name}<br/></span> : null
      let cruiseLocation = (this.state.activeCruise.cruise_location)? <span><strong>Location:</strong> {this.state.activeCruise.cruise_location}<br/></span> : null
      let cruiseDescription = (this.state.activeCruise.cruise_additional_meta.cruise_description)? <span><strong>Description:</strong> {this.state.activeCruise.cruise_additional_meta.cruise_description}<br/></span> : null
      let cruiseDates = <span><strong>Dates:</strong> {moment.utc(this.state.activeCruise.start_ts).format("YYYY/MM/DD")} - {moment.utc(this.state.activeCruise.stop_ts).format("YYYY/MM/DD")}<br/></span>
      let cruisePi = (this.state.activeCruise.cruise_pi)? <span><strong>Chief Scientist:</strong> {this.state.activeCruise.cruise_pi}<br/></span> : null

      return (          
        <Panel key={`cruise_${this.state.activeCruise.cruise_id}`}>
          <Panel.Heading><Panel.Title>{"Cruise: " + this.state.activeCruise.cruise_id}</Panel.Title></Panel.Heading>
          <Panel.Body>
            {cruiseName}
            {cruiseDescription}
            {cruiseLocation}
            {cruiseDates}
            {cruisePi}
            {cruiseFiles}
            { (this.state.cruiseLowerings && this.state.cruiseLowerings.length > 0)? (
              <div>
                <p><strong>Lowerings:</strong></p>
                <ul>
                  { this.state.cruiseLowerings.map(lowering => (
                      <li key={`select_${lowering.id}`} ><Link to="#" onClick={ () => this.handleLoweringSelect(lowering.id) }>{lowering.lowering_id}</Link><br/></li>
                    ))
                  }
                </ul>
              </div>
            ): null
            }
          </Panel.Body>
        </Panel>
      );
    }      
  }

  renderYearList() {

    if(this.state.years && this.state.years.size > 0){
      return (
        <PanelGroup id="accordion-controlled-year" accordion activeKey={this.state.activeYearKey} onSelect={this.handleYearSelect}>
          {this.renderYearListItems()}
        </PanelGroup>
      )
    }

    return (
      <Panel>
        <Panel.Body>No cruises found!</Panel.Body>
      </Panel>
    )
  }

  render(){
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h4>Welcome to Sealog</h4>
            {MAIN_SCREEN_TXT}
            <br/><br/>
          </Col>
        </Row>
        <Row>
          <Col sm={3} md={3} lg={2}>
            {this.renderYearList()}
          </Col>
          <Col sm={4} md={4} lg={5}>
            {this.renderCruisePanel()}
          </Col>
          <Col sm={5} md={5} lg={5}>
            {this.renderLoweringPanel()}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            Please select a cruise from the list above.  Once a cruise is selected please select a lowering from the list of lowerings associated with that cruise that appear at the bottom of the cruise information panel.  Selecting a lowering will open the lowering information panel.  At the bottom of the cruise information panel there will be buttons for proceeding to the lowering replay section of Sealog or the lowering event search section of Sealog.
            If at any time you wish to return to this page please click the "Sealog" text in upper-left part of the window.
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    cruise: state.cruise.cruise,
    cruises: state.cruise.cruises,
    lowering: state.lowering.lowering,  
    lowerings: state.lowering.lowerings,  
    roles: state.user.profile.roles
  }
}

export default connect(mapStateToProps, null)(CruiseMenu);
