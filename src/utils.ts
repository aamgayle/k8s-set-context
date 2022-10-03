import * as core from '@actions/core'
import * as fs from 'fs'
import {KubeConfig} from '@kubernetes/client-node'
import {getDefaultKubeconfig} from './kubeconfigs/default'
import {getArcKubeconfig} from './kubeconfigs/arc'
import {getAKSKubeconfig} from './kubeconfigs/aks'
import {Cluster} from './types/cluster'

/**
 * Gets the kubeconfig based on Kubernetes cluster type
 * @param type The cluster type for the kubeconfig (defaults to generic)
 * @returns A promise of the kubeconfig
 */
export async function getKubeconfig(
   type: Cluster | undefined
): Promise<string> {
   switch (type) {
      case Cluster.ARC: {
         return await getArcKubeconfig()
      }
      case Cluster.AKS: {
         return await getAKSKubeconfig()
      }
      case undefined: {
         core.warning('Cluster type not recognized. Defaulting to generic.')
      }
      default: {
         return getDefaultKubeconfig()
      }
   }
}

/**
 * Sets the context by updating the kubeconfig
 * @param kubeconfig The kubeconfig
 * @returns Updated kubeconfig with the context
 */
export function setContext(kubeconfig: string): string {
   const context: string = core.getInput('context')
   if (!context) {
      core.debug("Can't set context because context is unspecified.")
      return kubeconfig
   }

   // load current kubeconfig
   const kc = new KubeConfig()
   kc.loadFromString(kubeconfig)

   // update kubeconfig
   kc.setCurrentContext(context)
   return kc.exportConfig()
}

/**
 * Takes a kubeconfig path and exports the value to a variable accessible by other actions: KUBECONFIG
 * @param kubeconfigPath
 */
export async function setKubeconfigPath(kubeconfigPath: string) {
   fs.chmodSync(kubeconfigPath, '600')
   core.debug('Setting KUBECONFIG environment variable')
   core.exportVariable('KUBECONFIG', kubeconfigPath)
}
