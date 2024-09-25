"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegRunner = void 0;
const component_1 = require("../component");
const dependencies_1 = require("../dependencies");
/**
 * This component adds support for using `integ-runner` and `integ-tests`
 * in a construct library.
 */
class IntegRunner extends component_1.Component {
    constructor(project) {
        super(project);
        project.deps.addDependency("@aws-cdk/integ-runner@latest", dependencies_1.DependencyType.DEVENV);
        project.deps.addDependency("@aws-cdk/integ-tests-alpha@latest", dependencies_1.DependencyType.DEVENV);
        const integSnapshotTask = project.addTask("integ", {
            description: "Run integration snapshot tests",
            receiveArgs: true,
            exec: "integ-runner $@ --language typescript",
        });
        project.addTask("integ:update", {
            description: "Run and update integration snapshot tests",
            exec: "integ-runner $@ --language typescript --update-on-failed",
            receiveArgs: true,
        });
        project.testTask.spawn(integSnapshotTask);
    }
}
exports.IntegRunner = IntegRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWctcnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F3c2Nkay9pbnRlZy1ydW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBQXlDO0FBQ3pDLGtEQUFpRDtBQUdqRDs7O0dBR0c7QUFDSCxNQUFhLFdBQVksU0FBUSxxQkFBUztJQUN4QyxZQUFZLE9BQTBCO1FBQ3BDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUN4Qiw4QkFBOEIsRUFDOUIsNkJBQWMsQ0FBQyxNQUFNLENBQ3RCLENBQUM7UUFDRixPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FDeEIsbUNBQW1DLEVBQ25DLDZCQUFjLENBQUMsTUFBTSxDQUN0QixDQUFDO1FBRUYsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNqRCxXQUFXLEVBQUUsZ0NBQWdDO1lBQzdDLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLElBQUksRUFBRSx1Q0FBdUM7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7WUFDOUIsV0FBVyxFQUFFLDJDQUEyQztZQUN4RCxJQUFJLEVBQUUsMERBQTBEO1lBQ2hFLFdBQVcsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDNUMsQ0FBQztDQUNGO0FBM0JELGtDQTJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRcIjtcbmltcG9ydCB7IERlcGVuZGVuY3lUeXBlIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llc1wiO1xuaW1wb3J0IHsgVHlwZVNjcmlwdFByb2plY3QgfSBmcm9tIFwiLi4vdHlwZXNjcmlwdFwiO1xuXG4vKipcbiAqIFRoaXMgY29tcG9uZW50IGFkZHMgc3VwcG9ydCBmb3IgdXNpbmcgYGludGVnLXJ1bm5lcmAgYW5kIGBpbnRlZy10ZXN0c2BcbiAqIGluIGEgY29uc3RydWN0IGxpYnJhcnkuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlZ1J1bm5lciBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFR5cGVTY3JpcHRQcm9qZWN0KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICBwcm9qZWN0LmRlcHMuYWRkRGVwZW5kZW5jeShcbiAgICAgIFwiQGF3cy1jZGsvaW50ZWctcnVubmVyQGxhdGVzdFwiLFxuICAgICAgRGVwZW5kZW5jeVR5cGUuREVWRU5WXG4gICAgKTtcbiAgICBwcm9qZWN0LmRlcHMuYWRkRGVwZW5kZW5jeShcbiAgICAgIFwiQGF3cy1jZGsvaW50ZWctdGVzdHMtYWxwaGFAbGF0ZXN0XCIsXG4gICAgICBEZXBlbmRlbmN5VHlwZS5ERVZFTlZcbiAgICApO1xuXG4gICAgY29uc3QgaW50ZWdTbmFwc2hvdFRhc2sgPSBwcm9qZWN0LmFkZFRhc2soXCJpbnRlZ1wiLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJSdW4gaW50ZWdyYXRpb24gc25hcHNob3QgdGVzdHNcIixcbiAgICAgIHJlY2VpdmVBcmdzOiB0cnVlLFxuICAgICAgZXhlYzogXCJpbnRlZy1ydW5uZXIgJEAgLS1sYW5ndWFnZSB0eXBlc2NyaXB0XCIsXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LmFkZFRhc2soXCJpbnRlZzp1cGRhdGVcIiwge1xuICAgICAgZGVzY3JpcHRpb246IFwiUnVuIGFuZCB1cGRhdGUgaW50ZWdyYXRpb24gc25hcHNob3QgdGVzdHNcIixcbiAgICAgIGV4ZWM6IFwiaW50ZWctcnVubmVyICRAIC0tbGFuZ3VhZ2UgdHlwZXNjcmlwdCAtLXVwZGF0ZS1vbi1mYWlsZWRcIixcbiAgICAgIHJlY2VpdmVBcmdzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC50ZXN0VGFzay5zcGF3bihpbnRlZ1NuYXBzaG90VGFzayk7XG4gIH1cbn1cbiJdfQ==