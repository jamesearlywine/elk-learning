export declare const PULL_REQUEST_REF = "${{ github.event.pull_request.head.ref }}";
export declare const PULL_REQUEST_REPOSITORY = "${{ github.event.pull_request.head.repo.full_name }}";
export declare const BUILD_JOBID = "build";
export declare const SELF_MUTATION_STEP = "self_mutation";
export declare const SELF_MUTATION_HAPPENED_OUTPUT = "self_mutation_happened";
export declare const IS_FORK = "github.event.pull_request.head.repo.full_name != github.repository";
export declare const NOT_FORK = "!(github.event.pull_request.head.repo.full_name != github.repository)";
export declare const SELF_MUTATION_CONDITION = "needs.build.outputs.self_mutation_happened";
export declare const DEFAULT_ARTIFACTS_DIRECTORY = "dist";
