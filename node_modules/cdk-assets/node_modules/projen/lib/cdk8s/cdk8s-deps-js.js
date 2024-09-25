"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cdk8sDepsJs = void 0;
const cdk8s_deps_1 = require("./cdk8s-deps");
class Cdk8sDepsJs extends cdk8s_deps_1.Cdk8sDeps {
    packageNames() {
        return {
            cdk8s: "cdk8s",
            cdk8sClient: "cdk8s-cli",
            constructs: "constructs",
            cdk8sPlus: "cdk8s-plus",
        };
    }
}
exports.Cdk8sDepsJs = Cdk8sDepsJs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrOHMtZGVwcy1qcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jZGs4cy9jZGs4cy1kZXBzLWpzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUE0RDtBQUU1RCxNQUFhLFdBQVksU0FBUSxzQkFBUztJQUM5QixZQUFZO1FBQ3BCLE9BQU87WUFDTCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFVBQVUsRUFBRSxZQUFZO1lBQ3hCLFNBQVMsRUFBRSxZQUFZO1NBQ3hCLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFURCxrQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENkazhzRGVwcywgQ2RrOHNQYWNrYWdlTmFtZXMgfSBmcm9tIFwiLi9jZGs4cy1kZXBzXCI7XG5cbmV4cG9ydCBjbGFzcyBDZGs4c0RlcHNKcyBleHRlbmRzIENkazhzRGVwcyB7XG4gIHByb3RlY3RlZCBwYWNrYWdlTmFtZXMoKTogQ2RrOHNQYWNrYWdlTmFtZXMge1xuICAgIHJldHVybiB7XG4gICAgICBjZGs4czogXCJjZGs4c1wiLFxuICAgICAgY2RrOHNDbGllbnQ6IFwiY2RrOHMtY2xpXCIsXG4gICAgICBjb25zdHJ1Y3RzOiBcImNvbnN0cnVjdHNcIixcbiAgICAgIGNkazhzUGx1czogXCJjZGs4cy1wbHVzXCIsXG4gICAgfTtcbiAgfVxufVxuIl19