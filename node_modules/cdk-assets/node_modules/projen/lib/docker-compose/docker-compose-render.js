"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDockerComposeFile = renderDockerComposeFile;
const util_1 = require("../util");
function renderDockerComposeFile(serviceDescriptions, version) {
    // Record volume configuration
    const volumeConfig = {};
    const volumeInfo = {
        addVolumeConfiguration(volumeName, configuration) {
            if (!volumeConfig[volumeName]) {
                // First volume configuration takes precedence.
                volumeConfig[volumeName] = configuration;
            }
        },
    };
    // Record network configuration
    const networkConfig = {};
    const networkInfo = {
        addNetworkConfiguration(networkName, configuration) {
            if (!networkConfig[networkName]) {
                // First network configuration takes precedence.
                networkConfig[networkName] = configuration;
            }
        },
    };
    // Render service configuration
    const services = {};
    for (const [serviceName, serviceDescription] of Object.entries(serviceDescriptions ?? {})) {
        // Resolve the names of each dependency and check that they exist.
        // Note: They may not exist if the user made a mistake when referencing a
        // service by name via `DockerCompose.serviceName()`.
        // @see DockerCompose.serviceName
        const dependsOn = Array();
        for (const dependsOnServiceName of serviceDescription.dependsOn ?? []) {
            const resolvedServiceName = dependsOnServiceName.serviceName;
            if (resolvedServiceName === serviceName) {
                throw new Error(`Service ${serviceName} cannot depend on itself`);
            }
            if (!serviceDescriptions[resolvedServiceName]) {
                throw new Error(`Unable to resolve service named ${resolvedServiceName} for ${serviceName}`);
            }
            dependsOn.push(resolvedServiceName);
        }
        // Give each volume binding a chance to bind any necessary volume
        // configuration and provide volume mount information for the service.
        const volumes = [];
        for (const volumeBinding of serviceDescription.volumes ?? []) {
            volumes.push(volumeBinding.bind(volumeInfo));
        }
        // Give each network binding a chance to bind any necessary network
        // configuration and provide network mount information for the service.
        const networks = [];
        for (const networkBinding of serviceDescription.networks ?? []) {
            networks.push(networkBinding.bind(networkInfo));
        }
        // Create and store the service configuration, taking care not to create
        // object members with undefined values.
        services[serviceName] = {
            ...getObjectWithKeyAndValueIfValueIsDefined("image", serviceDescription.image),
            ...getObjectWithKeyAndValueIfValueIsDefined("build", serviceDescription.imageBuild),
            ...getObjectWithKeyAndValueIfValueIsDefined("entrypoint", serviceDescription.entrypoint),
            ...getObjectWithKeyAndValueIfValueIsDefined("command", serviceDescription.command),
            ...getObjectWithKeyAndValueIfValueIsDefined("platform", serviceDescription.platform),
            ...getObjectWithKeyAndValueIfValueIsDefined("privileged", serviceDescription.privileged),
            ...(Object.keys(serviceDescription.environment).length > 0
                ? { environment: serviceDescription.environment }
                : {}),
            ...(serviceDescription.ports.length > 0
                ? { ports: serviceDescription.ports }
                : {}),
            ...(Object.keys(serviceDescription.labels).length > 0
                ? { labels: serviceDescription.labels }
                : {}),
            ...(dependsOn.length > 0 ? { dependsOn } : {}),
            ...(volumes.length > 0 ? { volumes } : {}),
            ...(networks.length > 0 ? { networks } : {}),
        };
    }
    // Explicit with the type here because the decamelize step after this wipes
    // out types.
    const input = {
        ...(version ? { version } : {}),
        services,
        ...(Object.keys(volumeConfig).length > 0 ? { volumes: volumeConfig } : {}),
        ...(Object.keys(networkConfig).length > 0
            ? { networks: networkConfig }
            : {}),
    };
    // Change most keys to snake case.
    return (0, util_1.decamelizeKeysRecursively)(input, {
        shouldDecamelize: shouldDecamelizeDockerComposeKey,
        separator: "_",
    });
}
/**
 * Returns `{ [key]: value }` if `value` is defined, otherwise returns `{}` so
 * that object spreading can be used to generate a peculiar interface.
 * @param key
 * @param value
 */
function getObjectWithKeyAndValueIfValueIsDefined(key, value) {
    return value !== undefined ? { [key]: value } : {};
}
/**
 * Determines whether the key at the given path should be decamelized.
 * Largely, all keys should be snake cased. But, there are some
 * exceptions for user-provided names for services, volumes, and
 * environment variables.
 *
 * @param path
 */
function shouldDecamelizeDockerComposeKey(path) {
    const poundPath = path.join("#");
    // Does not decamelize user's names.
    // services.namehere:
    // volumes.namehere:
    // networks.namehere:
    if (/^(services|volumes|networks)#[^#]+$/.test(poundPath)) {
        return false;
    }
    // Does not decamelize environment variables and labels
    // services.namehere.environment.*
    // services.namehere.labels.*
    if (/^services#[^#]+#(environment|labels)#/.test(poundPath)) {
        return false;
    }
    // Does not decamelize build arguments
    // services.namehere.build.args.*
    if (/^services#[^#]+#build#args#/.test(poundPath)) {
        return false;
    }
    // Otherwise, let it all decamelize.
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ja2VyLWNvbXBvc2UtcmVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RvY2tlci1jb21wb3NlL2RvY2tlci1jb21wb3NlLXJlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBDQSwwREErSEM7QUE3SkQsa0NBQW9EO0FBOEJwRCxTQUFnQix1QkFBdUIsQ0FDckMsbUJBQXlELEVBQ3pELE9BQWdCO0lBRWhCLDhCQUE4QjtJQUM5QixNQUFNLFlBQVksR0FBOEMsRUFBRSxDQUFDO0lBQ25FLE1BQU0sVUFBVSxHQUErQjtRQUM3QyxzQkFBc0IsQ0FDcEIsVUFBa0IsRUFDbEIsYUFBd0M7WUFFeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUM5QiwrQ0FBK0M7Z0JBQy9DLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLENBQUM7WUFDM0MsQ0FBQztRQUNILENBQUM7S0FDRixDQUFDO0lBQ0YsK0JBQStCO0lBQy9CLE1BQU0sYUFBYSxHQUErQyxFQUFFLENBQUM7SUFDckUsTUFBTSxXQUFXLEdBQWdDO1FBQy9DLHVCQUF1QixDQUNyQixXQUFtQixFQUNuQixhQUF5QztZQUV6QyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLGdEQUFnRDtnQkFDaEQsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGFBQWEsQ0FBQztZQUM3QyxDQUFDO1FBQ0gsQ0FBQztLQUNGLENBQUM7SUFFRiwrQkFBK0I7SUFDL0IsTUFBTSxRQUFRLEdBQW1ELEVBQUUsQ0FBQztJQUNwRSxLQUFLLE1BQU0sQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUM1RCxtQkFBbUIsSUFBSSxFQUFFLENBQzFCLEVBQUUsQ0FBQztRQUNGLGtFQUFrRTtRQUNsRSx5RUFBeUU7UUFDekUscURBQXFEO1FBQ3JELGlDQUFpQztRQUNqQyxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQVUsQ0FBQztRQUNsQyxLQUFLLE1BQU0sb0JBQW9CLElBQUksa0JBQWtCLENBQUMsU0FBUyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ3RFLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxDQUFDO1lBQzdELElBQUksbUJBQW1CLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxXQUFXLDBCQUEwQixDQUFDLENBQUM7WUFDcEUsQ0FBQztZQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sSUFBSSxLQUFLLENBQ2IsbUNBQW1DLG1CQUFtQixRQUFRLFdBQVcsRUFBRSxDQUM1RSxDQUFDO1lBQ0osQ0FBQztZQUVELFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsaUVBQWlFO1FBQ2pFLHNFQUFzRTtRQUN0RSxNQUFNLE9BQU8sR0FBK0IsRUFBRSxDQUFDO1FBQy9DLEtBQUssTUFBTSxhQUFhLElBQUksa0JBQWtCLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxtRUFBbUU7UUFDbkUsdUVBQXVFO1FBQ3ZFLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUM5QixLQUFLLE1BQU0sY0FBYyxJQUFJLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUMvRCxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsd0VBQXdFO1FBQ3hFLHdDQUF3QztRQUN4QyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUc7WUFDdEIsR0FBRyx3Q0FBd0MsQ0FDekMsT0FBTyxFQUNQLGtCQUFrQixDQUFDLEtBQUssQ0FDekI7WUFDRCxHQUFHLHdDQUF3QyxDQUN6QyxPQUFPLEVBQ1Asa0JBQWtCLENBQUMsVUFBVSxDQUM5QjtZQUNELEdBQUcsd0NBQXdDLENBQ3pDLFlBQVksRUFDWixrQkFBa0IsQ0FBQyxVQUFVLENBQzlCO1lBQ0QsR0FBRyx3Q0FBd0MsQ0FDekMsU0FBUyxFQUNULGtCQUFrQixDQUFDLE9BQU8sQ0FDM0I7WUFDRCxHQUFHLHdDQUF3QyxDQUN6QyxVQUFVLEVBQ1Ysa0JBQWtCLENBQUMsUUFBUSxDQUM1QjtZQUNELEdBQUcsd0NBQXdDLENBQ3pDLFlBQVksRUFDWixrQkFBa0IsQ0FBQyxVQUFVLENBQzlCO1lBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ3hELENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pELENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDUCxHQUFHLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxFQUFFO2dCQUNyQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ1AsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25ELENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDUCxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM5QyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUM3QyxDQUFDO0lBQ0osQ0FBQztJQUVELDJFQUEyRTtJQUMzRSxhQUFhO0lBQ2IsTUFBTSxLQUFLLEdBQTRCO1FBQ3JDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMvQixRQUFRO1FBQ1IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMxRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUN2QyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFO1lBQzdCLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDUixDQUFDO0lBRUYsa0NBQWtDO0lBQ2xDLE9BQU8sSUFBQSxnQ0FBeUIsRUFBQyxLQUFLLEVBQUU7UUFDdEMsZ0JBQWdCLEVBQUUsZ0NBQWdDO1FBQ2xELFNBQVMsRUFBRSxHQUFHO0tBQ2YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyx3Q0FBd0MsQ0FDL0MsR0FBTSxFQUNOLEtBQVE7SUFFUixPQUFPLEtBQUssS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3JELENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxnQ0FBZ0MsQ0FBQyxJQUFjO0lBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFakMsb0NBQW9DO0lBQ3BDLHFCQUFxQjtJQUNyQixvQkFBb0I7SUFDcEIscUJBQXFCO0lBQ3JCLElBQUkscUNBQXFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDMUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsdURBQXVEO0lBQ3ZELGtDQUFrQztJQUNsQyw2QkFBNkI7SUFDN0IsSUFBSSx1Q0FBdUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUM1RCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsaUNBQWlDO0lBQ2pDLElBQUksNkJBQTZCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDbEQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERvY2tlckNvbXBvc2VCdWlsZCB9IGZyb20gXCIuL2RvY2tlci1jb21wb3NlXCI7XG5pbXBvcnQge1xuICBEb2NrZXJDb21wb3NlTmV0d29ya0NvbmZpZyxcbiAgSURvY2tlckNvbXBvc2VOZXR3b3JrQ29uZmlnLFxufSBmcm9tIFwiLi9kb2NrZXItY29tcG9zZS1uZXR3b3JrXCI7XG5pbXBvcnQgeyBEb2NrZXJDb21wb3NlU2VydmljZVBvcnQgfSBmcm9tIFwiLi9kb2NrZXItY29tcG9zZS1wb3J0XCI7XG5pbXBvcnQgeyBEb2NrZXJDb21wb3NlU2VydmljZSB9IGZyb20gXCIuL2RvY2tlci1jb21wb3NlLXNlcnZpY2VcIjtcbmltcG9ydCB7XG4gIERvY2tlckNvbXBvc2VWb2x1bWVDb25maWcsXG4gIERvY2tlckNvbXBvc2VWb2x1bWVNb3VudCxcbiAgSURvY2tlckNvbXBvc2VWb2x1bWVDb25maWcsXG59IGZyb20gXCIuL2RvY2tlci1jb21wb3NlLXZvbHVtZVwiO1xuaW1wb3J0IHsgZGVjYW1lbGl6ZUtleXNSZWN1cnNpdmVseSB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIGEgZG9ja2VyIGNvbXBvc2UgZmlsZSdzIHNlcnZpY2UgYmVmb3JlIHdlIGRlY2FtZWxpemUuXG4gKiBAaW50ZXJuYWxcbiAqL1xuaW50ZXJmYWNlIERvY2tlckNvbXBvc2VGaWxlU2VydmljZVNjaGVtYSB7XG4gIHJlYWRvbmx5IGRlcGVuZHNPbj86IHN0cmluZ1tdO1xuICByZWFkb25seSBidWlsZD86IERvY2tlckNvbXBvc2VCdWlsZDtcbiAgcmVhZG9ubHkgaW1hZ2U/OiBzdHJpbmc7XG4gIHJlYWRvbmx5IGNvbW1hbmQ/OiBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgdm9sdW1lcz86IERvY2tlckNvbXBvc2VWb2x1bWVNb3VudFtdO1xuICByZWFkb25seSBuZXR3b3Jrcz86IHN0cmluZ1tdO1xuICByZWFkb25seSBwb3J0cz86IERvY2tlckNvbXBvc2VTZXJ2aWNlUG9ydFtdO1xuICByZWFkb25seSBlbnZpcm9ubWVudD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHJlYWRvbmx5IGxhYmVscz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHJlYWRvbmx5IGVudHJ5cG9pbnQ/OiBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgcHJpdmlsZWdlZD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIGEgZG9ja2VyIGNvbXBvc2UgZmlsZSBiZWZvcmUgd2UgZGVjYW1lbGl6ZS5cbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgRG9ja2VyQ29tcG9zZUZpbGVTY2hlbWEge1xuICB2ZXJzaW9uPzogc3RyaW5nO1xuICBzZXJ2aWNlczogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZUZpbGVTZXJ2aWNlU2NoZW1hPjtcbiAgdm9sdW1lcz86IFJlY29yZDxzdHJpbmcsIERvY2tlckNvbXBvc2VWb2x1bWVDb25maWc+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRG9ja2VyQ29tcG9zZUZpbGUoXG4gIHNlcnZpY2VEZXNjcmlwdGlvbnM6IFJlY29yZDxzdHJpbmcsIERvY2tlckNvbXBvc2VTZXJ2aWNlPixcbiAgdmVyc2lvbj86IHN0cmluZ1xuKTogb2JqZWN0IHtcbiAgLy8gUmVjb3JkIHZvbHVtZSBjb25maWd1cmF0aW9uXG4gIGNvbnN0IHZvbHVtZUNvbmZpZzogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZVZvbHVtZUNvbmZpZz4gPSB7fTtcbiAgY29uc3Qgdm9sdW1lSW5mbzogSURvY2tlckNvbXBvc2VWb2x1bWVDb25maWcgPSB7XG4gICAgYWRkVm9sdW1lQ29uZmlndXJhdGlvbihcbiAgICAgIHZvbHVtZU5hbWU6IHN0cmluZyxcbiAgICAgIGNvbmZpZ3VyYXRpb246IERvY2tlckNvbXBvc2VWb2x1bWVDb25maWdcbiAgICApIHtcbiAgICAgIGlmICghdm9sdW1lQ29uZmlnW3ZvbHVtZU5hbWVdKSB7XG4gICAgICAgIC8vIEZpcnN0IHZvbHVtZSBjb25maWd1cmF0aW9uIHRha2VzIHByZWNlZGVuY2UuXG4gICAgICAgIHZvbHVtZUNvbmZpZ1t2b2x1bWVOYW1lXSA9IGNvbmZpZ3VyYXRpb247XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbiAgLy8gUmVjb3JkIG5ldHdvcmsgY29uZmlndXJhdGlvblxuICBjb25zdCBuZXR3b3JrQ29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBEb2NrZXJDb21wb3NlTmV0d29ya0NvbmZpZz4gPSB7fTtcbiAgY29uc3QgbmV0d29ya0luZm86IElEb2NrZXJDb21wb3NlTmV0d29ya0NvbmZpZyA9IHtcbiAgICBhZGROZXR3b3JrQ29uZmlndXJhdGlvbihcbiAgICAgIG5ldHdvcmtOYW1lOiBzdHJpbmcsXG4gICAgICBjb25maWd1cmF0aW9uOiBEb2NrZXJDb21wb3NlTmV0d29ya0NvbmZpZ1xuICAgICkge1xuICAgICAgaWYgKCFuZXR3b3JrQ29uZmlnW25ldHdvcmtOYW1lXSkge1xuICAgICAgICAvLyBGaXJzdCBuZXR3b3JrIGNvbmZpZ3VyYXRpb24gdGFrZXMgcHJlY2VkZW5jZS5cbiAgICAgICAgbmV0d29ya0NvbmZpZ1tuZXR3b3JrTmFtZV0gPSBjb25maWd1cmF0aW9uO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG5cbiAgLy8gUmVuZGVyIHNlcnZpY2UgY29uZmlndXJhdGlvblxuICBjb25zdCBzZXJ2aWNlczogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZUZpbGVTZXJ2aWNlU2NoZW1hPiA9IHt9O1xuICBmb3IgKGNvbnN0IFtzZXJ2aWNlTmFtZSwgc2VydmljZURlc2NyaXB0aW9uXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICBzZXJ2aWNlRGVzY3JpcHRpb25zID8/IHt9XG4gICkpIHtcbiAgICAvLyBSZXNvbHZlIHRoZSBuYW1lcyBvZiBlYWNoIGRlcGVuZGVuY3kgYW5kIGNoZWNrIHRoYXQgdGhleSBleGlzdC5cbiAgICAvLyBOb3RlOiBUaGV5IG1heSBub3QgZXhpc3QgaWYgdGhlIHVzZXIgbWFkZSBhIG1pc3Rha2Ugd2hlbiByZWZlcmVuY2luZyBhXG4gICAgLy8gc2VydmljZSBieSBuYW1lIHZpYSBgRG9ja2VyQ29tcG9zZS5zZXJ2aWNlTmFtZSgpYC5cbiAgICAvLyBAc2VlIERvY2tlckNvbXBvc2Uuc2VydmljZU5hbWVcbiAgICBjb25zdCBkZXBlbmRzT24gPSBBcnJheTxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBkZXBlbmRzT25TZXJ2aWNlTmFtZSBvZiBzZXJ2aWNlRGVzY3JpcHRpb24uZGVwZW5kc09uID8/IFtdKSB7XG4gICAgICBjb25zdCByZXNvbHZlZFNlcnZpY2VOYW1lID0gZGVwZW5kc09uU2VydmljZU5hbWUuc2VydmljZU5hbWU7XG4gICAgICBpZiAocmVzb2x2ZWRTZXJ2aWNlTmFtZSA9PT0gc2VydmljZU5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJ2aWNlICR7c2VydmljZU5hbWV9IGNhbm5vdCBkZXBlbmQgb24gaXRzZWxmYCk7XG4gICAgICB9XG4gICAgICBpZiAoIXNlcnZpY2VEZXNjcmlwdGlvbnNbcmVzb2x2ZWRTZXJ2aWNlTmFtZV0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gcmVzb2x2ZSBzZXJ2aWNlIG5hbWVkICR7cmVzb2x2ZWRTZXJ2aWNlTmFtZX0gZm9yICR7c2VydmljZU5hbWV9YFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBkZXBlbmRzT24ucHVzaChyZXNvbHZlZFNlcnZpY2VOYW1lKTtcbiAgICB9XG5cbiAgICAvLyBHaXZlIGVhY2ggdm9sdW1lIGJpbmRpbmcgYSBjaGFuY2UgdG8gYmluZCBhbnkgbmVjZXNzYXJ5IHZvbHVtZVxuICAgIC8vIGNvbmZpZ3VyYXRpb24gYW5kIHByb3ZpZGUgdm9sdW1lIG1vdW50IGluZm9ybWF0aW9uIGZvciB0aGUgc2VydmljZS5cbiAgICBjb25zdCB2b2x1bWVzOiBEb2NrZXJDb21wb3NlVm9sdW1lTW91bnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgdm9sdW1lQmluZGluZyBvZiBzZXJ2aWNlRGVzY3JpcHRpb24udm9sdW1lcyA/PyBbXSkge1xuICAgICAgdm9sdW1lcy5wdXNoKHZvbHVtZUJpbmRpbmcuYmluZCh2b2x1bWVJbmZvKSk7XG4gICAgfVxuXG4gICAgLy8gR2l2ZSBlYWNoIG5ldHdvcmsgYmluZGluZyBhIGNoYW5jZSB0byBiaW5kIGFueSBuZWNlc3NhcnkgbmV0d29ya1xuICAgIC8vIGNvbmZpZ3VyYXRpb24gYW5kIHByb3ZpZGUgbmV0d29yayBtb3VudCBpbmZvcm1hdGlvbiBmb3IgdGhlIHNlcnZpY2UuXG4gICAgY29uc3QgbmV0d29ya3M6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBuZXR3b3JrQmluZGluZyBvZiBzZXJ2aWNlRGVzY3JpcHRpb24ubmV0d29ya3MgPz8gW10pIHtcbiAgICAgIG5ldHdvcmtzLnB1c2gobmV0d29ya0JpbmRpbmcuYmluZChuZXR3b3JrSW5mbykpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbmQgc3RvcmUgdGhlIHNlcnZpY2UgY29uZmlndXJhdGlvbiwgdGFraW5nIGNhcmUgbm90IHRvIGNyZWF0ZVxuICAgIC8vIG9iamVjdCBtZW1iZXJzIHdpdGggdW5kZWZpbmVkIHZhbHVlcy5cbiAgICBzZXJ2aWNlc1tzZXJ2aWNlTmFtZV0gPSB7XG4gICAgICAuLi5nZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkKFxuICAgICAgICBcImltYWdlXCIsXG4gICAgICAgIHNlcnZpY2VEZXNjcmlwdGlvbi5pbWFnZVxuICAgICAgKSxcbiAgICAgIC4uLmdldE9iamVjdFdpdGhLZXlBbmRWYWx1ZUlmVmFsdWVJc0RlZmluZWQoXG4gICAgICAgIFwiYnVpbGRcIixcbiAgICAgICAgc2VydmljZURlc2NyaXB0aW9uLmltYWdlQnVpbGRcbiAgICAgICksXG4gICAgICAuLi5nZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkKFxuICAgICAgICBcImVudHJ5cG9pbnRcIixcbiAgICAgICAgc2VydmljZURlc2NyaXB0aW9uLmVudHJ5cG9pbnRcbiAgICAgICksXG4gICAgICAuLi5nZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkKFxuICAgICAgICBcImNvbW1hbmRcIixcbiAgICAgICAgc2VydmljZURlc2NyaXB0aW9uLmNvbW1hbmRcbiAgICAgICksXG4gICAgICAuLi5nZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkKFxuICAgICAgICBcInBsYXRmb3JtXCIsXG4gICAgICAgIHNlcnZpY2VEZXNjcmlwdGlvbi5wbGF0Zm9ybVxuICAgICAgKSxcbiAgICAgIC4uLmdldE9iamVjdFdpdGhLZXlBbmRWYWx1ZUlmVmFsdWVJc0RlZmluZWQoXG4gICAgICAgIFwicHJpdmlsZWdlZFwiLFxuICAgICAgICBzZXJ2aWNlRGVzY3JpcHRpb24ucHJpdmlsZWdlZFxuICAgICAgKSxcbiAgICAgIC4uLihPYmplY3Qua2V5cyhzZXJ2aWNlRGVzY3JpcHRpb24uZW52aXJvbm1lbnQpLmxlbmd0aCA+IDBcbiAgICAgICAgPyB7IGVudmlyb25tZW50OiBzZXJ2aWNlRGVzY3JpcHRpb24uZW52aXJvbm1lbnQgfVxuICAgICAgICA6IHt9KSxcbiAgICAgIC4uLihzZXJ2aWNlRGVzY3JpcHRpb24ucG9ydHMubGVuZ3RoID4gMFxuICAgICAgICA/IHsgcG9ydHM6IHNlcnZpY2VEZXNjcmlwdGlvbi5wb3J0cyB9XG4gICAgICAgIDoge30pLFxuICAgICAgLi4uKE9iamVjdC5rZXlzKHNlcnZpY2VEZXNjcmlwdGlvbi5sYWJlbHMpLmxlbmd0aCA+IDBcbiAgICAgICAgPyB7IGxhYmVsczogc2VydmljZURlc2NyaXB0aW9uLmxhYmVscyB9XG4gICAgICAgIDoge30pLFxuICAgICAgLi4uKGRlcGVuZHNPbi5sZW5ndGggPiAwID8geyBkZXBlbmRzT24gfSA6IHt9KSxcbiAgICAgIC4uLih2b2x1bWVzLmxlbmd0aCA+IDAgPyB7IHZvbHVtZXMgfSA6IHt9KSxcbiAgICAgIC4uLihuZXR3b3Jrcy5sZW5ndGggPiAwID8geyBuZXR3b3JrcyB9IDoge30pLFxuICAgIH07XG4gIH1cblxuICAvLyBFeHBsaWNpdCB3aXRoIHRoZSB0eXBlIGhlcmUgYmVjYXVzZSB0aGUgZGVjYW1lbGl6ZSBzdGVwIGFmdGVyIHRoaXMgd2lwZXNcbiAgLy8gb3V0IHR5cGVzLlxuICBjb25zdCBpbnB1dDogRG9ja2VyQ29tcG9zZUZpbGVTY2hlbWEgPSB7XG4gICAgLi4uKHZlcnNpb24gPyB7IHZlcnNpb24gfSA6IHt9KSxcbiAgICBzZXJ2aWNlcyxcbiAgICAuLi4oT2JqZWN0LmtleXModm9sdW1lQ29uZmlnKS5sZW5ndGggPiAwID8geyB2b2x1bWVzOiB2b2x1bWVDb25maWcgfSA6IHt9KSxcbiAgICAuLi4oT2JqZWN0LmtleXMobmV0d29ya0NvbmZpZykubGVuZ3RoID4gMFxuICAgICAgPyB7IG5ldHdvcmtzOiBuZXR3b3JrQ29uZmlnIH1cbiAgICAgIDoge30pLFxuICB9O1xuXG4gIC8vIENoYW5nZSBtb3N0IGtleXMgdG8gc25ha2UgY2FzZS5cbiAgcmV0dXJuIGRlY2FtZWxpemVLZXlzUmVjdXJzaXZlbHkoaW5wdXQsIHtcbiAgICBzaG91bGREZWNhbWVsaXplOiBzaG91bGREZWNhbWVsaXplRG9ja2VyQ29tcG9zZUtleSxcbiAgICBzZXBhcmF0b3I6IFwiX1wiLFxuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGB7IFtrZXldOiB2YWx1ZSB9YCBpZiBgdmFsdWVgIGlzIGRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGB7fWAgc29cbiAqIHRoYXQgb2JqZWN0IHNwcmVhZGluZyBjYW4gYmUgdXNlZCB0byBnZW5lcmF0ZSBhIHBlY3VsaWFyIGludGVyZmFjZS5cbiAqIEBwYXJhbSBrZXlcbiAqIEBwYXJhbSB2YWx1ZVxuICovXG5mdW5jdGlvbiBnZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkPEsgZXh0ZW5kcyBzdHJpbmcsIFQ+KFxuICBrZXk6IEssXG4gIHZhbHVlOiBUXG4pOiB7IEs6IFQgfSB8IHt9IHtcbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgPyB7IFtrZXldOiB2YWx1ZSB9IDoge307XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBrZXkgYXQgdGhlIGdpdmVuIHBhdGggc2hvdWxkIGJlIGRlY2FtZWxpemVkLlxuICogTGFyZ2VseSwgYWxsIGtleXMgc2hvdWxkIGJlIHNuYWtlIGNhc2VkLiBCdXQsIHRoZXJlIGFyZSBzb21lXG4gKiBleGNlcHRpb25zIGZvciB1c2VyLXByb3ZpZGVkIG5hbWVzIGZvciBzZXJ2aWNlcywgdm9sdW1lcywgYW5kXG4gKiBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gKlxuICogQHBhcmFtIHBhdGhcbiAqL1xuZnVuY3Rpb24gc2hvdWxkRGVjYW1lbGl6ZURvY2tlckNvbXBvc2VLZXkocGF0aDogc3RyaW5nW10pIHtcbiAgY29uc3QgcG91bmRQYXRoID0gcGF0aC5qb2luKFwiI1wiKTtcblxuICAvLyBEb2VzIG5vdCBkZWNhbWVsaXplIHVzZXIncyBuYW1lcy5cbiAgLy8gc2VydmljZXMubmFtZWhlcmU6XG4gIC8vIHZvbHVtZXMubmFtZWhlcmU6XG4gIC8vIG5ldHdvcmtzLm5hbWVoZXJlOlxuICBpZiAoL14oc2VydmljZXN8dm9sdW1lc3xuZXR3b3JrcykjW14jXSskLy50ZXN0KHBvdW5kUGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEb2VzIG5vdCBkZWNhbWVsaXplIGVudmlyb25tZW50IHZhcmlhYmxlcyBhbmQgbGFiZWxzXG4gIC8vIHNlcnZpY2VzLm5hbWVoZXJlLmVudmlyb25tZW50LipcbiAgLy8gc2VydmljZXMubmFtZWhlcmUubGFiZWxzLipcbiAgaWYgKC9ec2VydmljZXMjW14jXSsjKGVudmlyb25tZW50fGxhYmVscykjLy50ZXN0KHBvdW5kUGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEb2VzIG5vdCBkZWNhbWVsaXplIGJ1aWxkIGFyZ3VtZW50c1xuICAvLyBzZXJ2aWNlcy5uYW1laGVyZS5idWlsZC5hcmdzLipcbiAgaWYgKC9ec2VydmljZXMjW14jXSsjYnVpbGQjYXJncyMvLnRlc3QocG91bmRQYXRoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIE90aGVyd2lzZSwgbGV0IGl0IGFsbCBkZWNhbWVsaXplLlxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==