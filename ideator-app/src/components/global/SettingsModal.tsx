import { useState, useEffect } from 'react'
import Modal from '@/components/composites/Modal.tsx'
import Button from '@/components/ui/Button.tsx'
import Input from '@/components/ui/Input.tsx'
import Icon from '@/components/ui/Icon.tsx'
import { db } from '@/db/database.ts'
import { APP_CONFIG } from '@/config/app.config.ts'
import type { AppSettings } from '@/types/settings.ts'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'api' | 'data' | 'about'

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('api')
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null)

  // API key visibility toggles
  const [showOpenAI, setShowOpenAI] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [showSerper, setShowSerper] = useState(false)

  // Delete confirmation state
  const [deleteStep, setDeleteStep] = useState(0) // 0: idle, 1: first confirm, 2: second confirm

  // Load settings from IndexedDB
  useEffect(() => {
    if (isOpen) {
      loadSettings()
      loadStorageUsage()
      // Reset visibility and delete state on modal reopen (FIX 3)
      setShowOpenAI(false)
      setShowAnthropic(false)
      setShowSerper(false)
      setDeleteStep(0)
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const allSettings = await db.settings.toArray()
      if (allSettings.length > 0) {
        setSettings(allSettings[0])
      } else {
        // Create default settings if none exist
        const newSettings: AppSettings = {
          id: 'default',
          llm: {
            provider: 'openai',
            apiKey: '',
            model: 'gpt-4o',
          },
          search: {
            enabled: false,
            apiKey: '',
            provider: 'serper',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await db.settings.add(newSettings)
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        setStorageUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        })
      } catch (error) {
        console.error('Failed to estimate storage:', error)
      }
    }
  }

  const handleSaveApiKeys = async () => {
    if (!settings) return
    setLoading(true)
    try {
      await db.settings.update(settings.id, {
        ...settings,
        updatedAt: new Date(),
      })
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAllData = async () => {
    if (deleteStep === 0) {
      setDeleteStep(1)
      return
    }
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }

    // deleteStep === 2: actually clear data
    setLoading(true)
    try {
      await db.files.clear()
      await db.concepts.clear()
      await db.clusters.clear()
      await db.analyses.clear()
      await db.visualizations.clear()
      await db.assets.clear()
      await db.provenance.clear()
      await db.queue.clear()
      // Don't clear settings
      setDeleteStep(0)
      await loadStorageUsage()
    } catch (error) {
      console.error('Failed to clear data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const updateApiKey = (field: 'openai' | 'anthropic' | 'serper', value: string) => {
    if (!settings) return

    // FIX 1: Store all keys regardless of active provider
    if (field === 'serper') {
      setSettings({
        ...settings,
        search: {
          ...settings.search,
          apiKey: value,
        },
      })
    } else if (field === 'openai') {
      setSettings({
        ...settings,
        llm: {
          ...settings.llm,
          apiKey: value,
        },
      })
    } else if (field === 'anthropic') {
      setSettings({
        ...settings,
        llm: {
          ...settings.llm,
          apiKey: value,
        },
      })
    }
  }

  const getApiKeyValue = (field: 'openai' | 'anthropic' | 'serper') => {
    if (!settings) return ''
    if (field === 'serper') return settings.search.apiKey || ''
    if (field === 'openai') return settings.llm.provider === 'openai' ? settings.llm.apiKey : ''
    if (field === 'anthropic') return settings.llm.provider === 'anthropic' ? settings.llm.apiKey : ''
    return ''
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Settings" className="max-w-2xl">
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {[
          { id: 'api', label: 'API Keys' },
          { id: 'data', label: 'Data Management' },
          { id: 'about', label: 'About' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as Tab)
              setDeleteStep(0) // Reset delete confirmation when switching tabs
            }}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className={styles.apiTab}>
            <p className={styles.apiDescription}>
              Configure API keys for LLM and search providers. Keys are stored locally in your browser.
            </p>

            {/* OpenAI API Key */}
            <div className={styles.inputWrapper}>
              <Input
                label="OpenAI API Key"
                type={showOpenAI ? 'text' : 'password'}
                value={getApiKeyValue('openai')}
                onChange={(e) => updateApiKey('openai', e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className={styles.toggleButton}
                aria-label={showOpenAI ? 'Hide key' : 'Show key'}
              >
                <Icon name={showOpenAI ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>

            {/* Anthropic API Key */}
            <div className={styles.inputWrapper}>
              <Input
                label="Anthropic API Key"
                type={showAnthropic ? 'text' : 'password'}
                value={getApiKeyValue('anthropic')}
                onChange={(e) => updateApiKey('anthropic', e.target.value)}
                placeholder="sk-ant-..."
              />
              <button
                type="button"
                onClick={() => setShowAnthropic(!showAnthropic)}
                className={styles.toggleButton}
                aria-label={showAnthropic ? 'Hide key' : 'Show key'}
              >
                <Icon name={showAnthropic ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>

            {/* Serper API Key */}
            <div className={styles.inputWrapper}>
              <Input
                label="Serper API Key (Optional)"
                type={showSerper ? 'text' : 'password'}
                value={getApiKeyValue('serper')}
                onChange={(e) => updateApiKey('serper', e.target.value)}
                placeholder="For web search capabilities"
              />
              <button
                type="button"
                onClick={() => setShowSerper(!showSerper)}
                className={styles.toggleButton}
                aria-label={showSerper ? 'Hide key' : 'Show key'}
              >
                <Icon name={showSerper ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>

            <div className={styles.actionRow}>
              <Button onClick={handleSaveApiKeys} loading={loading} variant="primary">
                Save API Keys
              </Button>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className={styles.dataTab}>
            {/* Storage Usage */}
            <div>
              <h3 className={styles.sectionTitle}>Storage Usage</h3>
              {storageUsage ? (
                <div className={styles.storageInfo}>
                  <div className={styles.storageRow}>
                    <span>Used:</span>
                    <span>{formatBytes(storageUsage.used)}</span>
                  </div>
                  <div className={styles.storageRow}>
                    <span>Available:</span>
                    <span>{formatBytes(storageUsage.quota)}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${storageUsage.quota > 0 ? (storageUsage.used / storageUsage.quota) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className={styles.storageUnavailable}>Storage estimation not available</p>
              )}
            </div>

            {/* Clear Data */}
            <div>
              <h3 className={styles.sectionTitle}>Clear All Data</h3>
              <p className={styles.clearDescription}>
                Permanently delete all files, concepts, analyses, and generated assets. This action cannot be undone.
              </p>
              <Button
                onClick={handleClearAllData}
                loading={loading}
                variant="danger"
                disabled={loading}
              >
                {deleteStep === 0 && 'Clear All Data'}
                {deleteStep === 1 && 'Are you sure?'}
                {deleteStep === 2 && 'This cannot be undone!'}
              </Button>
              {deleteStep > 0 && (
                <Button onClick={() => setDeleteStep(0)} variant="ghost" className={styles.cancelButton}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className={styles.aboutTab}>
            <div>
              <h3 className={styles.appTitle}>{APP_CONFIG.name}</h3>
              <p className={styles.appVersion}>Version {APP_CONFIG.version}</p>
            </div>

            <div>
              <h4 className={styles.subsectionTitle}>Description</h4>
              <p className={styles.subsectionText}>{APP_CONFIG.description}</p>
            </div>

            <div>
              <h4 className={styles.subsectionTitle}>Built With</h4>
              <p className={styles.subsectionText}>React, TypeScript, D3.js</p>
            </div>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                All data is stored locally in your browser using IndexedDB
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
