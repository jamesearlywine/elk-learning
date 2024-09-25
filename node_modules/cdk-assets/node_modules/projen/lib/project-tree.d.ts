import { Component } from "./component";
import { JsonFile } from "./json";
import { Project } from "./project";
export declare class ProjectTree extends Component {
    file: JsonFile;
    constructor(project: Project);
}
