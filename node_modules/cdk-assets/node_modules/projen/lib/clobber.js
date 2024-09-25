"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clobber = void 0;
const component_1 = require("./component");
class Clobber extends component_1.Component {
    constructor(project) {
        super(project);
        const task = this.project.addTask("clobber", {
            description: "hard resets to HEAD of origin and cleans the local repo",
            condition: "git diff --exit-code > /dev/null",
            env: {
                BRANCH: "$(git branch --show-current)",
            },
        });
        task.exec("git checkout -b scratch", {
            name: 'save current HEAD in "scratch" branch',
        });
        task.exec("git checkout $BRANCH");
        task.exec("git fetch origin", { name: "fetch latest changes from origin" });
        task.exec("git reset --hard origin/$BRANCH", {
            name: "hard reset to origin commit",
        });
        task.exec("git clean -fdx", { name: "clean all untracked files" });
        task.say('ready to rock! (unpushed commits are under the "scratch" branch)');
    }
}
exports.Clobber = Clobber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvYmJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jbG9iYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF3QztBQUd4QyxNQUFhLE9BQVEsU0FBUSxxQkFBUztJQUNwQyxZQUFZLE9BQWdCO1FBQzFCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUMzQyxXQUFXLEVBQUUseURBQXlEO1lBQ3RFLFNBQVMsRUFBRSxrQ0FBa0M7WUFDN0MsR0FBRyxFQUFFO2dCQUNILE1BQU0sRUFBRSw4QkFBOEI7YUFDdkM7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ25DLElBQUksRUFBRSx1Q0FBdUM7U0FDOUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0NBQWtDLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxJQUFJLENBQUMsaUNBQWlDLEVBQUU7WUFDM0MsSUFBSSxFQUFFLDZCQUE2QjtTQUNwQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsR0FBRyxDQUNOLGtFQUFrRSxDQUNuRSxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBekJELDBCQXlCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gXCIuL3Byb2plY3RcIjtcblxuZXhwb3J0IGNsYXNzIENsb2JiZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICBjb25zdCB0YXNrID0gdGhpcy5wcm9qZWN0LmFkZFRhc2soXCJjbG9iYmVyXCIsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcImhhcmQgcmVzZXRzIHRvIEhFQUQgb2Ygb3JpZ2luIGFuZCBjbGVhbnMgdGhlIGxvY2FsIHJlcG9cIixcbiAgICAgIGNvbmRpdGlvbjogXCJnaXQgZGlmZiAtLWV4aXQtY29kZSA+IC9kZXYvbnVsbFwiLFxuICAgICAgZW52OiB7XG4gICAgICAgIEJSQU5DSDogXCIkKGdpdCBicmFuY2ggLS1zaG93LWN1cnJlbnQpXCIsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGFzay5leGVjKFwiZ2l0IGNoZWNrb3V0IC1iIHNjcmF0Y2hcIiwge1xuICAgICAgbmFtZTogJ3NhdmUgY3VycmVudCBIRUFEIGluIFwic2NyYXRjaFwiIGJyYW5jaCcsXG4gICAgfSk7XG4gICAgdGFzay5leGVjKFwiZ2l0IGNoZWNrb3V0ICRCUkFOQ0hcIik7XG4gICAgdGFzay5leGVjKFwiZ2l0IGZldGNoIG9yaWdpblwiLCB7IG5hbWU6IFwiZmV0Y2ggbGF0ZXN0IGNoYW5nZXMgZnJvbSBvcmlnaW5cIiB9KTtcbiAgICB0YXNrLmV4ZWMoXCJnaXQgcmVzZXQgLS1oYXJkIG9yaWdpbi8kQlJBTkNIXCIsIHtcbiAgICAgIG5hbWU6IFwiaGFyZCByZXNldCB0byBvcmlnaW4gY29tbWl0XCIsXG4gICAgfSk7XG4gICAgdGFzay5leGVjKFwiZ2l0IGNsZWFuIC1mZHhcIiwgeyBuYW1lOiBcImNsZWFuIGFsbCB1bnRyYWNrZWQgZmlsZXNcIiB9KTtcbiAgICB0YXNrLnNheShcbiAgICAgICdyZWFkeSB0byByb2NrISAodW5wdXNoZWQgY29tbWl0cyBhcmUgdW5kZXIgdGhlIFwic2NyYXRjaFwiIGJyYW5jaCknXG4gICAgKTtcbiAgfVxufVxuIl19