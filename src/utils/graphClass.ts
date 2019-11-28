import deepClone, {getCookie} from '@/utils/utils'
import Vue from 'vue'
import {allPropType, fieldDefaultValue, neededProp} from '@/utils/labelField';
import {settingTemplate} from '@/utils/settingTemplate';
import {InfoPart} from "@/store/modules/dataManager";

let newIdRegex = new RegExp('\\$_[0-9]*');
let ctrlPropRegex = new RegExp('\\$.*');
let crucialRegex = new RegExp('_.*');
export type id = number | string
export type type = 'node' | 'link' | 'document' | 'media';
export type mediaStatus = 'new' | 'remote' | 'uploading' | 'error' | 'success'
export var globalIndex = 0;
export const itemEqual = (itemA: Setting, itemB: Setting) => itemA._id === itemB._id && itemA._type === itemB._type;
export const findItem = (list: Array<SettingPart>, _id: id, _type: type) => list.filter(item => item.Setting._id === _id && item.Setting._type === _type);
export const getIsSelf = (ctrl: BaseCtrl) => ctrl.CreateUser.toString() === getCookie('user_id');

export function getType(file: File) {
  const mime = require('mime/lite');
  const mimeTypes = (file: File) => mime.getType(file.name.split('.')[1]);
  const mimeFile = mimeTypes(file);
  let result;
  if (mimeFile) {
    const mimeType = mimeFile.split('/');
    mimeType[0] === 'application'
      ? result = mimeType[1]
      : result = mimeType[0];
  } else {
    result = file.name.split('.')[1];
  }
  return result;
}

export interface QueryObject {
  _id: id,
  _type: string,
  _label: string
}

export interface GraphBackend {
  Base: {
    Info: BaseNodeInfo,
    Ctrl: BaseNodeCtrl
  },
  Graph: {
    nodes: Array<NodeSetting>,
    links: Array<compressLinkSetting>,
    medias: Array<MediaSetting>
    notes: Array<Notes>
  },
  Conf: GraphSetting,
  Path: Array<Object>
}

interface Text {
  [propName: string]: string
}

interface UserConcern {
  Imp: number,
  HardLevel: number,
  Useful: number,
  isStar: boolean,
  isShared: boolean,
  isGood: boolean,
  isBad: boolean,
  Labels: Array<string>
}

interface BaseState {
  isSelected: boolean, // 是否被选中
  isDeleted: boolean // 是否被删除
  [propName: string]: boolean
}

interface NodeState extends BaseState {
  // 用于node media
  showCard: boolean, // 是否显示卡片
  isMouseOn: boolean, // 是否鼠标放置在上面
  isAdd: boolean, // 是否是新建的
}

interface LinkState extends BaseState {
  // 暂时和Node一样
  showCard: boolean, // 是否显示卡片
  isMouseOn: boolean, // 是否鼠标放置在上面
  isAdd: boolean, // 是否是新建的
}

interface GraphState extends BaseState {
  isLoading: boolean,
  isChanged: boolean,
  SavedIn5Min: boolean // 5分钟内是否保存
}

export const InfoToSetting = (payload: { id: id, type: type, PrimaryLabel: string }) => ({
  _id: payload.id,
  _type: payload.type,
  _label: payload.PrimaryLabel
} as Setting);

interface BaseInfo {
  id: id,
  type: type,
  PrimaryLabel: string,
  $IsCommon: boolean,
  $IsShared: boolean,
  $IsOpenSource: boolean,
}

interface BaseCtrl {
  $IsUserMade: boolean,
  CreateUser: string | number,
  UpdateTime: string,
}

export interface NodeInfoPartBackend {
  Info: BaseNodeInfo,
  Ctrl: BaseNodeCtrl
}

export interface BaseNodeInfo extends BaseInfo {
  type: 'node' | 'document',
  Name: string,
  Alias: Array<string>,
  BaseImp: number,
  BaseHardLevel: number,
  Language: string,
  Topic: Array<string>,
  Labels: Array<string>,
  ExtraProps: Object,
  Text: Text,
  IncludedMedia: Array<string | number>,
  MainPic: string,

  [propName: string]: any
}

export interface BaseNodeCtrl extends BaseCtrl {
  PrimaryLabel: string,
  Imp: number,
  HardLevel: number,
  Useful: number,
  isStar: number,
  isShared: number,
  isGood: number,
  isBad: number,
  Labels: Array<string>
  Contributor: Object,
  TotalTime: number,
}

export interface BaseMediaInfo extends BaseInfo {
  type: 'media',
  Name: string,
  Labels: Array<string>,
  Text: Text,
  ExtraProps: Object,

  [propName: string]: any
}

interface BaseMediaCtrl extends BaseCtrl {
  FileName: string, // URL
  Format: string, // 格式
  Thumb: string, // 缩略图
  isStar: number,
  isShared: number,
  isGood: number,
  isBad: number,
  Labels: Array<string>
}

export interface MediaInfoPartBackend {
  Info: BaseMediaInfo,
  Ctrl: BaseMediaCtrl
}

interface BaseLinkInfo extends BaseInfo {
  type: 'link',
  Labels: Array<string>,
  ExtraProps: Object,
  Text: Text,
  Confidence: number,

  [propName: string]: any
}

export interface BaseLinkCtrl extends BaseCtrl {
  Start: NodeSettingPart,
  End: NodeSettingPart,
}

interface LinkCtrlBackend extends BaseCtrl {
  Start: QueryObject,
  End: QueryObject
}

export interface LinkInfoPartBackend {
  Info: BaseLinkInfo,
  Ctrl: LinkCtrlBackend
}

export interface Setting {
  _id: id,
  _type: type,
  _label: string,

  [propName: string]: Object
}

export interface NodeSetting extends Setting {
  _name: string,
  _image: string
}

export interface MediaSetting extends Setting {
  _name: string,
  _src: string // url字符串或者 URL.createObjectUrl返回值
}

export interface LinkSetting extends Setting {
  _start: VisualNodeSettingPart
  _end: VisualNodeSettingPart
}

interface compressLinkSetting extends Setting {
  _start: Setting,
  _end: Setting
}

interface GraphSetting extends Setting {

}

export type VisualNodeSettingPart = NodeSettingPart | MediaSettingPart // 从视觉上来说是Node的对象

export function nodeStateTemplate(...rest: Array<string>) {
  return <NodeState>{
    'isSelected': false,
    'showCard': false,
    'isMouseOn': false,
    'isDeleted': false,
    'isAdd': rest.indexOf('isAdd') > -1
  };
}

export function linkStateTemplate(...rest: Array<string>) {
  return <LinkState>{
    'isSelected': false,
    'showCard': false,
    'isMouseOn': false,
    'isDeleted': false,
    'isAdd': rest.indexOf('isAdd') > -1
  };
}

export function graphStateTemplate(...rest: Array<string>) {
  return <GraphState>{
    'isSelected': false,
    'showCard': false,
    'isMouseOn': false,
    'isDeleted': false,
    'isChanged': false,
    'SavedIn5Min': false,
    'isSelf': rest.indexOf('isSelf') > -1,
    'isAdd': rest.indexOf('isAdd') > -1,
    'isLoading': rest.indexOf('isLoading') > -1
  };
}

export function userConcernTemplate() {
  return <UserConcern>{
    Imp: -1,
    HardLevel: -1,
    Useful: -1,
    isStar: false,
    isGood: false,
    isBad: false,
    isShared: false,
    Labels: []
  }
}

export function nodeInfoTemplate(_id: id, _type: string, _label: string) {
  let info = <BaseNodeInfo>{
    id: _id,
    type: _type
  };
  let dict = Object.assign({}, allPropType.BaseNode, allPropType[_label]);
  Object.entries(dict).forEach(([key, value]) => {
    let type = value.type;
    info[key] = fieldDefaultValue[type]
  });
  // 特别定义
  _type !== 'document'
    ? info.Name = 'LoadingNode' + _id
    : info.Name = 'NewDocument' + _id;
  info.Language = 'auto';
  info.PrimaryLabel = _label;
  info.$IsOpenSource = false;
  return info
}

export function nodeCtrlTemplate(_label: string) {
  // Ctrl数据
  let time = new Date();
  return <BaseNodeCtrl>{
    $IsUserMade: true,
    CreateUser: getCookie('user_id'),
    UpdateTime: time.toLocaleDateString(),
    PrimaryLabel: _label,
    Imp: 50,
    HardLevel: 50,
    Useful: 50,
    isStar: 0,
    isShared: 0,
    isGood: 0,
    isBad: 0,
    Contributor: {create: getCookie('user_name'), update: []},
    TotalTime: 50,
    Labels: []
  }
}

export function mediaInfoTemplate(_id: id, file: File) {
  return <BaseMediaInfo>{
    id: _id,
    type: 'media',
    PrimaryLabel: getType(file),
    Name: file.name.split('.')[0],
    Text: {},
    Labels: [],
    $IsCommon: true,
    $IsOpenSource: false,
    $IsShared: false,
    ExtraProps: {}
  }
}

export function mediaCtrlTemplate(file: File) {
  const time = new Date();
  // todo thumb提取 文件格式
  return <BaseMediaCtrl>{
    FileName: URL.createObjectURL(file),
    Format: file.name.split('.')[1],
    Thumb: '',
    UpdateTime: time.toLocaleDateString(),
    CreateUser: getCookie('user_id'),
    $IsUserMade: true,
    isStar: 0,
    isGood: 0,
    isBad: 0,
    isShared: 0,
    Labels: []
  }
}

export function linkInfoTemplate(_id: id, _label: string) {
  return <BaseLinkInfo>{
    id: _id,
    type: 'link',
    PrimaryLabel: _label,
    $IsCommon: true,
    $IsShared: false,
    $IsOpenSource: false,
    Labels: [],
    ExtraProps: {},
    Text: {},
    Confidence: 0.5
  }
}

export function linkCtrlTemplate(_start: VisualNodeSettingPart, _end: VisualNodeSettingPart) {
  let time = new Date();
  return <BaseLinkCtrl>{
    UpdateTime: time.toLocaleDateString(),
    CreateUser: getCookie('user_id'),
    $IsUserMade: true,
    Start: _start,
    End: _end
  }
}

export class NodeInfoPart {
  id: id;
  isRemote: boolean;
  isEdit: boolean;
  Info: BaseNodeInfo;
  Ctrl: BaseNodeCtrl;
  UserConcern: UserConcern;

  constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, userConcern: UserConcern) {
    const id = info.id;
    this.isRemote = newIdRegex.test(id.toString());
    this.isEdit = false;
    this.id = id;
    this.Info = info;
    this.Ctrl = ctrl;
    this.UserConcern = userConcern;
  }

  static emptyNodeInfoPart(_id: id, _type: string, _label: string) {
    return new NodeInfoPart(nodeInfoTemplate(_id, _type, _label), nodeCtrlTemplate(_label), userConcernTemplate())
  }

  // info修改值
  updateValue(prop: string, newValue: any) {
    if (ctrlPropRegex.test(prop) || prop === 'PrimaryLabel') {
      console.log('不要使用updateValue更新控制属性')
    } else {
      this.isEdit = true;
      Vue.set(this.Info, prop, newValue)
    }
  }

  updateUserConcern(prop: 'isStar' | 'isGood' | 'isBad' | 'isShared') {
    Vue.set(this.UserConcern, prop, !this.UserConcern[prop]);
    this.UserConcern[prop]
      ? this.Ctrl[prop] += 1
      : this.Ctrl[prop] -= 1
  }

  changeId(newId: id) {
    this.id = newId;
    Vue.set(this.Info, 'id', newId);
    this.synchronizationSource('_id', newId);
    this.isRemote = newIdRegex.test(newId.toString());
    this.isEdit = false;
  }

  changePrimaryLabel(newLabel: string) {
    if (this.isRemote) {
      console.log('如果是远端节点 那么PLabel不能修改')
    } else {
      let info = <BaseNodeInfo>{
        id: this.id,
        type: this.Info.type
      };
      Object.entries(neededProp(newLabel)).forEach(([prop, value]) => {
        let type = value.type;
        this.Info.indexOf(prop) === -1
          ? info[prop] = fieldDefaultValue[type]
          : info[prop] = this.Info[prop]
      });
      Vue.set(this, 'Info', info);
      Vue.set(this.Ctrl, 'PrimaryLabel', newLabel);
      Vue.set(this.Info, 'PrimaryLabel', newLabel);
      this.synchronizationSource('_label', newLabel);
      this.isEdit = true;
    }
  }

  changeName(newName: string) {
    Vue.set(this.Info, 'Name', newName);
    this.synchronizationSource('_name', newName)
  }

  changeImage(newImage: string, nodeList: Array<NodeSettingPart>) {
    Vue.set(this.Info, 'MainPic', newImage);
    this.synchronizationSource('_image', newImage)
  }

  synchronizationSource(prop: string, value: any) {
    let nodeList = NodeSettingPart.list;
    crucialRegex.test(prop) && findItem(nodeList, this.id, this.Info.type).map(node => node.updateCrucial(prop, value))
  }

  synchronizationAll() {
    // 同步所有属性到Setting
    let nodeList = NodeSettingPart.list;
    findItem(nodeList, this.id, this.Info.type).map(node => {
      node.updateCrucial('_label', this.Info.PrimaryLabel);
      node.updateCrucial('_name', this.Info.Name);
      node.updateCrucial('_image', this.Info.MainPic)
    })
  }

  save() {

  }
}

export class LinkInfoPart {
  id: id;
  isRemote: boolean;
  isEdit: boolean;
  Info: BaseLinkInfo;
  Ctrl: BaseLinkCtrl;

  constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl) {
    const id = info.id;
    this.id = id;
    this.isRemote = newIdRegex.test(id.toString());
    this.isEdit = false;
    this.Info = info;
    this.Ctrl = ctrl;
  }

  static emptyLinkInfo(_id: id, _label: string, _start: VisualNodeSettingPart, _end: VisualNodeSettingPart) {
    return new LinkInfoPart(linkInfoTemplate(_id, _label), linkCtrlTemplate(_start, _end))
  }

  changeId(newId: id) {
    this.id = newId;
    this.updateValue('id', newId);
    this.synchronizationSource('_id', newId);
    this.isRemote = newIdRegex.test(newId.toString());
    this.isEdit = false;
  }

  changeLabel(newLabel: string) {
    this.updateValue('PrimaryLabel', newLabel);
    this.synchronizationSource('_label', newLabel)
  }

  changeNode(start: VisualNodeSettingPart | null, end: VisualNodeSettingPart | null) {
    if (!this.isRemote) {
      if (start && !itemEqual(this.Ctrl.Start.Setting, start.Setting)) {
        Vue.set(this.Ctrl, 'Start', start);
        this.synchronizationSource('_start', start);
      }

      if (end && !itemEqual(this.Ctrl.End.Setting, end.Setting)) {
        Vue.set(this.Ctrl, 'End', end);
        this.synchronizationSource('_end', end);
      }
    } else {
      console.log('远端关系不能改变了')
    }
  }

  updateValue(prop: string, newValue: any) {
    if (ctrlPropRegex.test(prop)) {
      console.log('不要使用updateValue更新控制属性')
    } else {
      this.isEdit = true;
      Vue.set(this.Info, prop, newValue);
    }
  }

  synchronizationSource(prop: string, value: any) {
    let linkList = LinkSettingPart.list;
    crucialRegex.test(prop) && findItem(linkList, this.id, this.Info.type).map(link => link.updateCrucial(prop, value))
  }

  synchronizationAll() {
    let linkList = LinkSettingPart.list;
    findItem(linkList, this.id, this.Info.type).map(link => {
      link.updateCrucial('_start', this.Ctrl.Start);
      link.updateCrucial('_end', this.Ctrl.End);
    })
  }
}

export class MediaInfoPart {
  id: id;
  file: File | Blob | Promise<any> | null;
  status: mediaStatus;
  isRemote: boolean;
  isEdit: boolean;
  Info: BaseMediaInfo;
  Ctrl: BaseMediaCtrl;
  UserConcern: UserConcern;

  constructor(info: BaseMediaInfo, ctrl: BaseMediaCtrl, userConcern: UserConcern, status: mediaStatus, file?: File) {
    let id = info.id;
    file
      ? (this.file = file)
      : (this.file = null);
    // todo File详细定义
    this.status = status;
    this.id = id;
    this.isRemote = newIdRegex.test(id.toString());
    this.isEdit = false;
    this.Info = info;
    this.Ctrl = ctrl;
    this.UserConcern = userConcern;
  }

  static emptyMediaInfo(_id: id, file: File) {
    return new MediaInfoPart(mediaInfoTemplate(_id, file), mediaCtrlTemplate(file), userConcernTemplate(), 'new', file)
  }

  changeId(newId: id) {
    this.id = newId;
    Vue.set(this.Info, 'id', newId);
    this.synchronizationSource('_id', newId);
    this.isRemote = newIdRegex.test(newId.toString());
    this.isEdit = false;
  }

  changeStatus(status: mediaStatus) {
    Vue.set(this, 'status', status)
  }

  changeSource(newSource: string) {
    Vue.set(this.Ctrl, 'FileName', newSource);
    this.synchronizationSource('_src', newSource)
  }

  // info修改值
  updateValue(prop: string, newValue: any) {
    if (ctrlPropRegex.test(prop) || prop === 'PrimaryLabel') {
      console.log('不要使用updateValue更新控制属性')
    } else {
      this.isEdit = true;
      Vue.set(this.Info, prop, newValue)
    }
  }

  updateUserConcern(prop: 'isStar' | 'isGood' | 'isBad' | 'isShared') {
    Vue.set(this.UserConcern, prop, !this.UserConcern[prop]);
    this.UserConcern[prop]
      ? this.Ctrl[prop] += 1
      : this.Ctrl[prop] -= 1
  }

  synchronizationSource(prop: string, value: any) {
    let mediaList = MediaSettingPart.list;
    crucialRegex.test(prop) && findItem(mediaList, this.id, this.Info.type).map(node => node.updateCrucial(prop, value))
  }

  synchronizationAll() {
    let nodeList = MediaSettingPart.list;
    findItem(nodeList, this.id, this.Info.type).map(node => {
      node.updateCrucial('_src', this.Ctrl.FileName);
      node.updateCrucial('_name', this.Info.Name);
    })
  }
}

export function nodeSettingTemplate(_id: id, _type: string, _label: string, _name: string, _image: string) {
  let setting = <NodeSetting>{
    _id,
    _type,
    _label,
    _name,
    _image
  };
  Object.assign(settingTemplate('node'), setting);
  return setting
}

export function linkSettingTemplate(_id: id, _label: string, _start: NodeSettingPart, _end: NodeSettingPart) {
  let setting = <LinkSetting>{
    _id,
    _type: 'link',
    _label,
    _start,
    _end
  };
  Object.assign(settingTemplate('link'), setting);
  return setting
}

export function mediaSettingTemplate(_id: id, _label: string, _name: string, _src: string) {
  let setting = <MediaSetting>{
    _id,
    _type: 'media',
    _label,
    _name,
    _src
  };
  Object.assign(settingTemplate('media'), setting);
  return setting
}

export function graphSettingTemplate(_id: id) {
  let setting = <GraphSetting>{
    _id,
    _type: 'document',
    _label: 'Doc2Graph'
  };
  Object.assign(settingTemplate('document'), setting);
  return setting
}

class SettingPart {
  Setting: Setting;
  State: BaseState;
  parent: GraphSelfPart | null;

  constructor(Setting: Setting, State: BaseState, parent: GraphSelfPart | null) {
    this.Setting = Setting;
    this.State = State;
    this.parent = parent
  }

  updateState(prop: string, value: boolean) {
    Vue.set(this.State, prop, value)
  }

  updateSetting(propGroup: string, prop: string, value: any) {
    Vue.set(this.Setting[propGroup], prop, value)
  }

  updateCrucial(prop: string, value: any) {
    crucialRegex.test(prop) && Vue.set(this.Setting, prop, value)
  }
}

export class NodeSettingPart extends SettingPart {
  Setting: NodeSetting;
  State: NodeState;
  parent: GraphSelfPart;
  static list: Array<NodeSettingPart> = [];

  constructor(Setting: NodeSetting, State: NodeState, parent: GraphSelfPart) {
    super(Setting, State, parent);
    this.Setting = Setting;
    this.State = State;
    this.parent = parent;
    NodeSettingPart.list.push(this);
  }

  static emptyNodeSetting(_id: id, _type: string, _label: string, _name: string, _image: string, parent: GraphSelfPart) {
    let setting = nodeSettingTemplate(_id, _type, _label, _name, _image);
    let state = nodeStateTemplate('isAdd');
    return new NodeSettingPart(setting, state, parent)
  }
}

export class MediaSettingPart extends SettingPart {
  Setting: MediaSetting;
  State: NodeState;
  parent: GraphSelfPart;
  static list: Array<MediaSettingPart> = [];

  constructor(Setting: MediaSetting, State: NodeState, parent: GraphSelfPart) {
    super(Setting, State, parent);
    this.Setting = Setting;
    this.State = State;
    this.parent = parent;
    MediaSettingPart.list.push(this);
  }

  static emptyMediaSetting(_id: id, _label: string, _name: string, _src: string, parent: GraphSelfPart) {
    let setting = mediaSettingTemplate(_id, _label, _name, _src);
    let state = nodeStateTemplate('isAdd');
    return new MediaSettingPart(setting, state, parent)
  }
}

export class LinkSettingPart extends SettingPart {
  Setting: LinkSetting;
  State: LinkState;
  parent: GraphSelfPart;
  static list: Array<LinkSettingPart> = [];

  constructor(Setting: LinkSetting, State: LinkState, parent: GraphSelfPart) {
    super(Setting, State, parent);
    this.Setting = Setting;
    this.State = State;
    this.parent = parent;
    LinkSettingPart.list.push(this);
  }

  static emptyLinkSetting(_id: id, _label: string, _start: NodeSettingPart, _end: NodeSettingPart, parent: GraphSelfPart) {
    let setting = linkSettingTemplate(_id, _label, _start, _end);
    let state = linkStateTemplate('isAdd');
    return new LinkSettingPart(setting, state, parent)
  }
}

export class GraphSettingPart extends SettingPart {
  Setting: GraphSetting;
  State: GraphState;
  parent: GraphSelfPart | null;

  constructor(Setting: Setting, State: GraphState, parent: GraphSelfPart | null) {
    super(Setting, <NodeState>{}, parent);
    this.Setting = Setting;
    this.State = State;
    this.parent = parent
  }

  static emptyGraphSetting(_id: id, parent: GraphSelfPart | null) {
    let setting = graphSettingTemplate(_id);
    let state = graphStateTemplate('isSelf', 'isAdd');
    return new GraphSettingPart(setting, state, parent)
  }
}

export class Notes {

}

interface Graph {
  nodes: Array<NodeSettingPart>
  links: Array<LinkSettingPart>
  medias: Array<MediaSettingPart>
  notes: Array<Notes>
}

export const findRoot = (item: SettingPart) => {
  if (!item.parent) {
    return []
  } else {
    let result: Array<GraphSelfPart> = [];
    item.parent.Conf
      ? result = result.concat(findRoot(item.parent.Conf))
      : result.push(item.parent.Conf);
    return result
  }
};

export class GraphSelfPart {
  Graph: Graph;
  Conf: GraphSettingPart;
  Path: Array<Object>; // todo Path
  id: id;
  draftId: number;
  rootList: Array<GraphSelfPart>; // Graph的遍历链条
  static list: Array<GraphSelfPart>;
  static baseList: Array<GraphBackend>; // 原始数据
  constructor(graph: Graph, setting: GraphSettingPart, path: Array<Object>, _id: id) {
    this.draftId = -1;
    this.id = _id;
    this.rootList = findRoot(setting);
    this.Conf = setting;
    this.Graph = graph;
    this.Path = path;
  }

  static emptyGraphSelfPart(_id: id, parent: GraphSelfPart | null) {
    let graph: Graph = {
      nodes: [],
      links: [],
      medias: [],
      notes: [],
    };
    let setting = GraphSettingPart.emptyGraphSetting(_id, parent);
    let path = [{}]; // todo path
    let graphSelf = new GraphSelfPart(graph, setting, path, _id);
    let graphSelfNode = NodeSettingPart.emptyNodeSetting(_id, 'document', 'DocGraph', 'NewDocument' + _id, '', graphSelf);
    graphSelf.Graph.nodes.push(graphSelfNode);
    return graphSelf
  }

  static resolveFromBackEnd(baseData: GraphBackend, parent: GraphSelfPart | null) {
    GraphSelfPart.baseList.push(baseData);
    let args = [];
    getIsSelf(baseData.Base.Ctrl) && args.push('isSelf');
    let state = graphStateTemplate(...args);
    let setting = new GraphSettingPart(baseData.Conf, state, parent);
    let graph = <Graph>{
      nodes: [],
      links: [],
      medias: [],
      notes: baseData.Graph.notes
    };
    let result = new GraphSelfPart(graph, setting, baseData.Path, baseData.Base.Info.id);
    result.Graph.nodes = baseData.Graph.nodes.map(setting => new NodeSettingPart(setting, nodeStateTemplate(), result));
    result.Graph.medias = baseData.Graph.medias.map(setting => new MediaSettingPart(setting, nodeStateTemplate(), result));
    result.Graph.links = baseData.Graph.links.map(setting => {
      let link = <LinkSetting>deepClone(setting);
      link._start = result.Graph.nodes.filter(node => itemEqual(setting._start, node.Setting))[0];
      link._end = result.Graph.nodes.filter(node => itemEqual(setting._end, node.Setting))[0];
      return new LinkSettingPart(link, linkStateTemplate(), result);
    });
    return result
  }

  autoSave() {

  }

  typeToList(_type: type) {
    let list;
    _type === 'link'
      ? list = this.Graph.links
      : _type === 'media'
      ? list = this.Graph.medias
      : list = this.Graph.nodes;
    return list
  }

  checkExist(_id: id, _type: type) {
    return findItem(this.typeToList(_type), _id, _type).length > 0
  }

  addNodes(nodes: Array<NodeSettingPart>) {
    nodes.filter(node => !this.checkExist(node.Setting._id, node.Setting._type)).map(node => {
      this.Graph.nodes.push(node);
      node.updateState('isAdd', true);
      newIdRegex.test(node.Setting._id.toString()) && (this.Conf.updateState('isChanged', true))
    });
  }

  addLinks(links: Array<LinkSettingPart>) {
    links.filter(link => !this.checkExist(link.Setting._id, link.Setting._type)).map(link => {
      this.Graph.links.push(link);
      link.updateState('isAdd', true);
      newIdRegex.test(link.Setting._id.toString()) && (this.Conf.updateState('isChanged', true))
    })
  }

  addMedias(medias: Array<MediaSettingPart>) {
    medias.filter(media => !this.checkExist(media.Setting._id, media.Setting._type)).map(media => {
      this.Graph.medias.push(media);
      media.updateState('isAdd', true);
      newIdRegex.test(media.Setting._id.toString()) && (this.Conf.updateState('isChanged', true))
    })
  }

  changeId(newId: id) {
    this.id = newId
  }
}
