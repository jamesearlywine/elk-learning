"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCdkPytestSample = void 0;
const __1 = require("..");
class AwsCdkPytestSample extends __1.Component {
    constructor(project, testdir) {
        super(project);
        new __1.SampleDir(project, testdir, {
            files: {
                "__init__.py": "",
                "test_example.py": [
                    "import pytest",
                    "from aws_cdk import App",
                    "from aws_cdk.assertions import Template",
                    "",
                    `from ${project.moduleName}.main import MyStack`,
                    "",
                    "@pytest.fixture(scope='module')",
                    "def template():",
                    "  app = App()",
                    '  stack = MyStack(app, "my-stack-test")',
                    "  template = Template.from_stack(stack)",
                    "  yield template",
                    "",
                    `def test_no_buckets_found(template):`,
                    '  template.resource_count_is("AWS::S3::Bucket", 0)',
                    "",
                ].join("\n"),
            },
        });
    }
}
exports.AwsCdkPytestSample = AwsCdkPytestSample;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzY2RrLXB5dGVzdC1zYW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXdzY2RrL2F3c2Nkay1weXRlc3Qtc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBCQUEwQztBQUcxQyxNQUFhLGtCQUFtQixTQUFRLGFBQVM7SUFDL0MsWUFBWSxPQUF3QixFQUFFLE9BQWU7UUFDbkQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxhQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtZQUM5QixLQUFLLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGlCQUFpQixFQUFFO29CQUNqQixlQUFlO29CQUNmLHlCQUF5QjtvQkFDekIseUNBQXlDO29CQUN6QyxFQUFFO29CQUNGLFFBQVEsT0FBTyxDQUFDLFVBQVUsc0JBQXNCO29CQUNoRCxFQUFFO29CQUNGLGlDQUFpQztvQkFDakMsaUJBQWlCO29CQUNqQixlQUFlO29CQUNmLHlDQUF5QztvQkFDekMseUNBQXlDO29CQUN6QyxrQkFBa0I7b0JBQ2xCLEVBQUU7b0JBQ0Ysc0NBQXNDO29CQUN0QyxvREFBb0Q7b0JBQ3BELEVBQUU7aUJBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2I7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1QkQsZ0RBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBTYW1wbGVEaXIgfSBmcm9tIFwiLi5cIjtcbmltcG9ydCB7IEF3c0Nka1B5dGhvbkFwcCB9IGZyb20gXCIuL2F3c2Nkay1hcHAtcHlcIjtcblxuZXhwb3J0IGNsYXNzIEF3c0Nka1B5dGVzdFNhbXBsZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IEF3c0Nka1B5dGhvbkFwcCwgdGVzdGRpcjogc3RyaW5nKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICBuZXcgU2FtcGxlRGlyKHByb2plY3QsIHRlc3RkaXIsIHtcbiAgICAgIGZpbGVzOiB7XG4gICAgICAgIFwiX19pbml0X18ucHlcIjogXCJcIixcbiAgICAgICAgXCJ0ZXN0X2V4YW1wbGUucHlcIjogW1xuICAgICAgICAgIFwiaW1wb3J0IHB5dGVzdFwiLFxuICAgICAgICAgIFwiZnJvbSBhd3NfY2RrIGltcG9ydCBBcHBcIixcbiAgICAgICAgICBcImZyb20gYXdzX2Nkay5hc3NlcnRpb25zIGltcG9ydCBUZW1wbGF0ZVwiLFxuICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgYGZyb20gJHtwcm9qZWN0Lm1vZHVsZU5hbWV9Lm1haW4gaW1wb3J0IE15U3RhY2tgLFxuICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgXCJAcHl0ZXN0LmZpeHR1cmUoc2NvcGU9J21vZHVsZScpXCIsXG4gICAgICAgICAgXCJkZWYgdGVtcGxhdGUoKTpcIixcbiAgICAgICAgICBcIiAgYXBwID0gQXBwKClcIixcbiAgICAgICAgICAnICBzdGFjayA9IE15U3RhY2soYXBwLCBcIm15LXN0YWNrLXRlc3RcIiknLFxuICAgICAgICAgIFwiICB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21fc3RhY2soc3RhY2spXCIsXG4gICAgICAgICAgXCIgIHlpZWxkIHRlbXBsYXRlXCIsXG4gICAgICAgICAgXCJcIixcbiAgICAgICAgICBgZGVmIHRlc3Rfbm9fYnVja2V0c19mb3VuZCh0ZW1wbGF0ZSk6YCxcbiAgICAgICAgICAnICB0ZW1wbGF0ZS5yZXNvdXJjZV9jb3VudF9pcyhcIkFXUzo6UzM6OkJ1Y2tldFwiLCAwKScsXG4gICAgICAgICAgXCJcIixcbiAgICAgICAgXS5qb2luKFwiXFxuXCIpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19